import {Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import fetch from 'node-fetch'

class CognitoMiddleware {

    private tokenExpiration: number;
    private iss: string;
    private userPoolId: string;
    private tokenUse: TokenUse;

    private initPromise: Promise<any>;
    private pems: Map<string, string>;

    constructor(config: CognitoConfig) {
        if (!config)
            throw new TypeError(
                "Options not found. Please refer to README for usage example at https://github.com/ghdna/cognito-express"
            );

        if (configurationIsCorrect(config)) {
            this.userPoolId = config.cognitoUserPoolId;
            this.tokenUse = config.tokenUse;
            this.tokenExpiration = config.tokenExpiration || 3600000;
            this.iss = `https://cognito-idp.${config.region}.amazonaws.com/${this.userPoolId}`;
            this.initPromise = this.init();
        }
    }

    init(callback?: (succeeded: boolean) => void) {
        return fetch(`${this.iss}/.well-known/jwks.json`)
            .then(rawResponse => rawResponse.json())
            .then(response => {
                this.pems = new Map<string, string>();
                const keys = response.keys;
                for (const key of keys) {
                    const keyId = key.kid;
                    const modulus = key.n;
                    const exponent = key.e;
                    const keyType = key.kty;
                    const jwk = { kty: keyType, n: modulus, e: exponent };
                    this.pems.set(keyId, jwkToPem(jwk));
                }
                if (callback) { callback(true) };
            })
            .catch(err => {
                if (callback) { callback(false) };
                throw new TypeError(
                    "Unable to generate certificate due to \n" + err
                );
            });
    }

    validate(token: string, callback: (err: any, tokenClaims: any) => void) {
        const p = this.initPromise.then(() => {
            const decodedJwt = jwt.decode(token, { complete: true });
            try {
                if (!decodedJwt) throw new TypeError('Not a valid JWT token');

                if (decodedJwt.payload.iss !== this.iss)
                    throw new TypeError('token is not from your User Pool');

                if (decodedJwt.payload.token_use !== this.tokenUse)
                    throw new TypeError(`Not an ${this.tokenUse} token`);

                const kid = decodedJwt.header.kid;
                const pem = this.pems.get(kid);

                if (!pem) throw new TypeError(`Invalid ${this.tokenUse} token`);

                const params = {
                    token,
                    pem,
                    iss: this.iss,
                    maxAge: this.tokenExpiration
                };
                if (callback) {
                    jwtVerify(params, callback);
                } else {
                    return new Promise((resolve, reject) => {
                        jwtVerify(params, (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    });
                }
            } catch(err) {
                if(!callback) throw err;

                callback(err.message, null);
            }
        });

        if (!callback) {
            return p;
        }
    }


    cognitoMiddleware(req: Request, res: Response, next: any) {
        this.validate(req.headers.authorization?.replace('Bearer ', ''), (err, tokenclaims) => {
            if (!!err) {
                res.sendStatus(401)
            } 
            else 
            {
                res.locals.claims = tokenclaims
                next();
            }
        })
    }
}

export enum TokenUse {
    access = "access",
    id = "id"
}

interface CognitoConfig {
    region: string;
    cognitoUserPoolId: string;
    tokenUse: TokenUse;
    tokenExpiration?: number;
}

function configurationIsCorrect(config: CognitoConfig) {
    switch (true) {
        case !config.region:
            throw new TypeError("AWS Region not specified in constructor");
        case !config.cognitoUserPoolId:
            throw new TypeError(
                "Cognito User Pool ID is not specified in constructor"
            );
        case !config.tokenUse:
            throw new TypeError(
                `Token use not specified in constructor. Possible values '${Object.values(TokenUse).join(' | ')}'`
            );
        case !Object.values(TokenUse).includes(config.tokenUse):
            throw new TypeError(
                "Token use values not accurate in the constructor. Possible values '${Object.values(TokenUse).join(' | ')}'"
            );
    }
    return true;
}

interface VerificationParameters {
    token: string;
    pem: jwt.Secret | jwt.GetPublicKeyOrSecret;
    iss: string | string[],
    maxAge: number
}

function jwtVerify(params: VerificationParameters, callback: (err: jwt.VerifyErrors, payload: jwt.JwtPayload) => any) {
    jwt.verify(
        params.token,
        params.pem,
        {
            issuer: params.iss,
            maxAge: params.maxAge.toString()
        },
        (err, payload) => {
            if (err) return callback(err, null);
            return callback(null, payload);
        }
    );
}

export default CognitoMiddleware;