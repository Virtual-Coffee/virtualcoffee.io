# [Virtual Coffee](https://virtualcoffee.io)

It's the (always remote) hallway track at the conference. A laid-back conversation with devs that's usually tech-related.

Anyone can join, whether you're just thinking about getting into tech or have been in it for decades. Come with a question or a topic to discuss, ask for feedback on your portfolio, or just sit back and listen to others talk about tech.

The purpose of the coffee is to form community, allow for growth and mentorship, and to both meet new people and hang out with the regulars in a safe and positive space.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/master/CODE_OF_CONDUCT.md)

See you there!

![](VirtualCoffee.png)



## Run and Install

### 1. Clone this Repository

```
git clone https://github.com/Virtual-Coffee/virtualcoffee.io.git virtualcoffee.io
```


### 2. Navigate to the directory

```
cd virtualcoffee.io
```

### 3. Install dependencies

```
yarn
```

At this point you're ready to roll! The following commands are available:

### `yarn start`

```
yarn start
```

Starts a local server running at http://localhost:9000 and watches the `src` directory for changes. Use this to preview local development.

### `yarn build`

```
yarn build
```

Builds a production-ready version of the site. This is what Netlify uses to build our site.

### `yarn build-preview`

```
yarn build-preview
```

If you'd like to see a preview of the production build, use this command to build the site and start up a server at http://localhost:9000. To see any subsequent changes, you can leave this server running, but you'll have to run `yarn build` again in another console tab.