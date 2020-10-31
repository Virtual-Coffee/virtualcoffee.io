# [Virtual Coffee](https://virtualcoffee.io)

Virtual Coffee is a laid-back conversation with developers twice a week. It's the conversation that keeps going in slack. It's the online events that support developers at all stages of the journey. It's the place where you go to make friends who all just happen to be in tech.

Anyone can join! Whether you're just thinking about getting into tech or have been in it for decades.

We know that growth comes at all levels and that no matter what stage of the journey you're on, you can teach and learn.

So come with a question or a topic to discuss, ask for feedback on your portfolio, answer another developer's question, or just sit back and listen to others talk about tech.

Our mission is to form community, allow room for growth and mentorship at all levels, and to provide a safe space for everyone interested in tech.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/master/CODE_OF_CONDUCT.md)

See you there!

![](VirtualCoffee.png)

## Local Development

Steps to run the site locally for development or curiosity

### 1. Fork and clone the repository

Follow [these steps](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) to create a fork of this repository and clone it to your local machine.


### 2. Navigate to the repo directory

If you have just run `git clone ...` , the next step would be to move into the cloned repo:

```
cd virtualcoffee.io
```

### 3. Install dependencies

```
npm install
```

At this point you're ready to roll! The following commands are available:

### `npm run start`

```
npm run start
```

This is the only command you need to do normal local development.

Starts a local server and watches the `src` directory for changes. Use this to preview local development.

Once you run this command, a local server is running at http://localhost:9000! Any changes you make to the src folder should also re-build the site and re-load your browser.

You should see 'Waiting...' below, which means the watcher is waiting to build your awesome changes!

Use ctrl-c to quit the server when you're done.


## Build Commands

The following commands are for building production-ready versions of the site. If you're interested in seeing what they look like on your machine, feel free to run them! But they are not needed for normal local development.

### `npm run build`

```
npm run build
```

Builds a production-ready version of the site. This is what Netlify uses to build our site.

### `npm run build-preview`

```
npm run build-preview
```

If you'd like to see a preview of the production build, use this command to build the site and start up a server at http://localhost:9000. To see any subsequent changes, you can leave this server running, but you'll have to run `npm build` again in another console tab.
