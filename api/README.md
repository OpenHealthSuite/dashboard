# PaceMe.js API

## Build Dependencies

Along with the below requirements, you'll need to install good-old `docker`

```bash
apt-get install qemu qemu-user-static binfmt-support debootstrap jq -y
```

You'll also want a local redis cache if you want to run locally

```bash
docker run --name paceme-redis -p 6379:6379 -d redis:6.2.6
```

## Build your image

There is a helper script to build and push up to your CDK ECR (assuming you saved an output json using the infrastructure script), you can run with `npm run docker:buildandpush`

## Some Kubernetes notes

Shamelessly stole the SSL cert magic from here: [https://www.thinktecture.com/en/kubernetes/ssl-certificates-with-cert-manager-in-kubernetes/](https://www.thinktecture.com/en/kubernetes/ssl-certificates-with-cert-manager-in-kubernetes/)

There was a crash loop issue with the helm version used in the guide though. Instead, just install from their own manifest.

https://cert-manager.io/docs/installation/

`kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.yaml`