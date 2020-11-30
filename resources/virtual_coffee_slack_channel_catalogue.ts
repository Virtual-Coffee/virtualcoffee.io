#!usr/bin/env node

/**
 * Return of this file should always be in JSON format.
 * Exhaustive example of a channel object:
 {
   id: 0,
   name: "admin_channel",
   icon: "/app/media/icons/epic_chalice_of_jewels.svg",
   description: "How'd you get in here!?! Guards, sieze them!!",
   moderators: ["Bekah HG Wells", "Danatello Otterman", "Mikhail Rogersonbergerville", "Klirk Beastwood"],
   reminders: [
     {
       priority: 1, // 0 should be reserved for emergency notifications
       "formatting": ["i", "-"],
       "url": "https://virtualcoffee.io/code-of-conduct/",
       "message": "Link to code of conduct"
     }
   ]
 }
 * 
 * template barebones channel object:
{
  name: "",
  id: generateNextChannelId(),
  description: "",
},
*/

interface Channel {
  id: number
  name: string
  description: string
  icon?: string
  moderators?: Array<string>
  reminders?: ChannelReminders[]
}
interface ChannelReminders {
  message: string
  formatting?: Array<"i"|"b"|"u"|"s"|"+"|"-"> // italics|bold|underline|strikethrough|fontSize up|fontSize down
  url?: string
  priority?: number // lesser number is higher priority
}

/** Closure to generate sequential id numbers.
 * Note: first invocation will return 1. 0 is withheld for admin channel.
*/
const generateNextChannelId = (
  function() {
    let counter = 0;
    return () => {
      counter +=1;
      return counter;
    };
  }
)();

/** channels object official */
const channels: Channel[] = [
  {
    name: "admin", 
    id: 0, 
    description: ""
  },
  {
    name: "welcome",
    id: generateNextChannelId(),
    description: "Virtual Coffee's front door! (Well, maybe lots of confetti and streamers instead of a door)"
  },
  {
    name: "general",
    id: generateNextChannelId(),
    description: "Community questions, event recaps and TPS reports from #mngmnt."
  },
  {
    name: "random",
    id: generateNextChannelId(),
    description: "Diverse dialogue! Bottomless banter! Excessive exclamations!",
    reminders: [
      {
        message: "All are encouraged to be familiar with our code of conduct before posting in any channel.",
        url: "https://virtualcoffee.io/code-of-conduct/"
      }
    ]
  },
  {
    name: "announcements",
    id: generateNextChannelId(),
    description: "This channel keeps you in the loop! Virtual Coffee endorsed events, links and dates are posted here."
  },
  {
    name: "articles-and-resources",
    id: generateNextChannelId(),
    description: "Got curiosity? Here are some things to help expand your code brain!"
  },
  {
    name: "brownbags",
    id: generateNextChannelId(),
    description: "The term 'brownbag' refers to an informal meeting, often held over a lunch break (lunches brought in brown bags) and provides a ~30 minute overview of a particular topic. These are exceptional opportunities to expand developer vocabulary and keep aware of new tech. Have a topic you want to talk about? We want to hear your brownbag on it!"
  },
  {
    name: "politics",
    id: generateNextChannelId(),
    description: "Discussions, comments and updates relevant to political ongoings.",
    reminders: [
      {
        message: "Virtual Coffee acknowledges that politics is an important but often divisive topic. Our goal is to promote positive interaction between those who have an interest in technology. All participants in this channel are expected to excercise mindfulness regarding context, audience and perception, as well as be familiar with the Code of Conduct.",
        url: "https://virtualcoffee.io/code-of-conduct/",
        formatting: ["i"],
        priority: 1
      }
    ]
  },
  {
    name: "heavy",
    id: generateNextChannelId(),
    description: "If you're having a bad day, feeling frustrated or just need a sanity check, this is the place to get it off your chest."
  },
  {
    name: "music",
    id: generateNextChannelId(),
    description: ""
  },
  {
    name: "frontend",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "consulting",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "book-club",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "add-adhd",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "event-chat",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "exercism",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "feed",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "fitness",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "food",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "game-night",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "gifts",
    id: generateNextChannelId(),
    description: "Gift ideas for any occassion! Especially the one that you forgot about until 5 minutes ago.",
  },
  {
    name: "goals-and-wins",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "happiness",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "help-and-pairing",
    id: generateNextChannelId(),
    description: "Having trouble with a project? Drop your questions and code snippets here for some community feedback.",
  },
  {
    name: "humor",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "job-hunt",
    id: generateNextChannelId(),
    description: "Job listings, discussions and questions.",
  },
  {
    name: "lgbtq-plus",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "lightning-talks",
    id: generateNextChannelId(),
    description: "Topics and times for lightning talks.",
  },
  {
    name: "monthly-challenge",
    id: generateNextChannelId(),
    description: "",
  },
  {
    name: "office-hours",
    id: generateNextChannelId(),
    description: "Some veteran VC members make time available to have 1-on-1 meetings. Find and reserve those times here.",
  },
  {
    name: "open-source",
    id: generateNextChannelId(),
    description: "Post, promote or join open source projects.",
  },
  {
    name: "parenting",
    id: generateNextChannelId(),
    description: "Best way to get lipstick off dog? How much toothpaste is poisonous? Is ____ supposed to be that color? ... ah the joys of parenting.",
  },
  {
    name: "past-midnight",
    id: generateNextChannelId(),
    description: "Creatures of the night such as vampires, werewolves, chronologically confused gophers and vitamin D deficient devs.",
  },
  {
    name: "region-europe",
    id: generateNextChannelId(),
    description: "Conversations for those in the beautiful country of Europe.",
  },
  {
    name: "tech-interview-study-group",
    id: generateNextChannelId(),
    description: "Help with preparing for technical interviews.",
  },
  {
    name: "tech-products",
    id: generateNextChannelId(),
    description: "Chatter and links about new or cool techie gear.",
  },
];

const main = {channels};

module.exports = JSON.stringify(main);
