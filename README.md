# [Virtual Coffee](https://virtualcoffee.io)

It's the (always remote) hallway track at the conference. A laid-back conversation with devs that's usually tech-related.

Anyone can join, whether you're just thinking about getting into tech or have been in it for decades. Come with a question or a topic to discuss, ask for feedback on your portfolio, or just sit back and listen to others talk about tech.

The purpose of the coffee is to form community, allow for growth and mentorship, and to both meet new people and hang out with the regulars in a safe and positive space.

Please take a moment to read our [Code of Conduct](https://github.com/Virtual-Coffee/virtualcoffee.io/blob/master/CODE_OF_CONDUCT.md)

See you there!

![](VirtualCoffee.png)

# WIP 11ty notes:

## Getting Started

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

### 4. Run Eleventy

If you don't have eleventy installed, you can run

```
npm i @11ty/eleventy or yarn add @11ty/eleventy
```

```
npx eleventy
```

Or build and host locally for local development

```
npx eleventy --serve
```

Or build automatically when a template changes:

```
npx eleventy --watch
```

Or in debug mode:

```
DEBUG=* npx eleventy
```
