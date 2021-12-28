# PaceMe.js API

## Build Dependencies

Along with the below requirements, you'll need to install good-old `docker`

```bash
apt-get install qemu qemu-user-static binfmt-support debootstrap jq -y
```

## Build your image

There is a helper script to build and push up to your CDK ECR (assuming you saved an output json using the infrastructure script), you can run with `npm run docker:buildandpush`