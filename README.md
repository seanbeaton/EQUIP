## EQUIP Observation Web Application

* Visit the application: http://www.equip.ninja
* See the documentation: http://docs.equip.ninja

## Run EQUIP yourself

If you don't want to use the public EQUIP app, you can install it yourself either locally, on a server in your network, or on a cloud service like heroku.

### Teacher/Researcher instructions

Follow these instructions if you're not so familiar with how to run programs from the command line. If you're a developer yourself, skip down to the [Developer instructions](#developer-instructions)

#### Downloading EQUIP

If you're looking to do a local install, you'll first need to download the files. 
You have two options - the recommended way and the not-so-recommended way.

##### The recommended way

We recommend downloading EQUIP via git, the version control software used to maintain the source code. It's installed by default on most linux and mac machines, and can be installed on windows by going to [https://git-scm.com](https://git-scm.com).

Once you have git, open a command line ("terminal" on mac, control-alt-t on ubuntu and other flavors of linux), then run

```bash
git clone git@github.com:seanbeaton/dataObs.git
```

This should copy all the files into a directory called `dataObs` in your active directory (typically `~/`, your home directory).

##### The not-so-recommended way

Github allows you to download a zip file of all the code for EQUIP. Doing it this way means you don't need git to download the files, but you won't be able to keep your installation up to date with all the latest feature and security updates.

#### Installing the requirements

Next up, you'll need to install meteor. Open a terminal if you don't have one open already, then running the following command


```bash
curl https://install.meteor.com/ | sh
```

#### Running the app

Now that you've got meteor installed and the app's files downloaded, you're ready to run the app. To do this, change directories into the app directory, `~/dataObs` if you didn't specify it earlier using the following command:

```bash
cd ~/dataObs
```

Then run the app!

```bash
meteor
```

It might take a few minutes to get set up the first time. By default, the app will be running at the following url: [http://localhost:3000](http://localhost:3000).

#### Recap

So, the commands you'll need to run the first time are:

```bash
git clone git@github.com:seanbeaton/dataObs.git  # Download the files
curl https://install.meteor.com/ | sh  # Install meteor
cd ~/dataObs  # Move into the directory where EQUIP's files are
meteor  # Run the app
```

Then whenever you want to run the app again, run 

```bash
meteor
```

again, and everything will be right where you left it. 

To stop the app, press control-c while you're in the terminal window you used to start the app. 

---

### Developer instructions

There's a few options, one is a local install, another would be to use a cloud provider like heroku or atmosphere. You could also install it on a server somewhere in your network.
#### Local install
Install meteor and clone the project:
```
curl https://install.meteor.com/ | sh
git clone git@github.com:seanbeaton/dataObs.git  # or whichever fork you want
```
Then run `meteor` to run the app:
```
meteor
```

#### Install on heroku
Create a new app, provision a mongodb server (we use mLab), choose your dyno (it'll work fine on hobby or even free dynos). 

Add a new buildpack, `https://github.com/AdmitHub/meteor-buildpack-horse.git`.

Set up your custom domain, if you want it. 

Push the code to your new heroku app, and you're set. You may need to set the env var `ROOT_URL` to the root url of your app, `https://www.equip.ninja/` for example.


