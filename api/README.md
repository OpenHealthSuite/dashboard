# PaceMe.js API

## Build Dependencies

Along with the below requirements, you'll need to install good-old `docker`

For building multi-arch images for pushing to docker

```bash
apt-get install qemu qemu-user-static binfmt-support debootstrap jq -y
```

## Build your image

There is a helper script to build and push up to docker hub (assuming you are me deploying to `LeeMartin77`), you can run with `npm run docker:buildandpush`. If you're not me, this can show you the needed args.

## Some Kubernetes notes

Right now, this has been setup to run on Microk8s on a raspberry pi, with the following addons:

- dashboard
- dns
- rbac
- helm3
- ingress

You'll also need to install cert-manager for certification using letsencrypt:

https://cert-manager.io/docs/installation/

`kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.yaml`
