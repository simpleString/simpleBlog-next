# Simple blog

![](/public/simpleStringBlogImage.png)

# [DEMO](https://simplestring.xyz)

## This is project of blog built using [next.js](https://nextjs.org/) and [trpc](https://trpc.io/).

## Using thecnologies

- **Nextjs** for backend + frontend
- Supabase (PostgreSQL + object storage)
- **tRPC** for typesave transfer data between front and back
- **Tailwind CSS** for styling
- **NextAuth.js** for all stuff with authentication
- **Prisma** ORM
- **Redis (Upstash)** for server side caching

### Key features:

- Optimistic updates for:

  - likes
  - Messages
  - Bookmarks

  ![](/githubImages/LikesUpdate.gif)

- Login with google
- Saving image in supabase (May save them in s3)
- Sorting alhorithms
- Advance search system
  ![](/githubImages/Search.gif)
- Automatic save drafts for unpublish post
  ![](/githubImages/CreateDraft.gif)
- Opportunity for bookmark posts
- Dark theme
  ![](/githubImages/DarkTheme.png)
- Client and server caching
- Rich WYSIWYG text editor
  ![](/githubImages/RichTextEditor.gif)
- Reddit like comment system
  ![](/githubImages/Comment.gif)

Post show algorithms:

- **_new_** - Show post sorted by date
- **_hot_** - Show post sorted by comments count and likes count with time period.
- **_best_** - Show post sorted by likes count with time period.

Time period allow show posts with sorting criteria for most relevant posts.

For search algorithms used another patterns:

- **_new_** - Show post sorted by date
- **_best_** - Show post sorted by likes count **without** time period.

## Feel free to fork or ask me something😀
