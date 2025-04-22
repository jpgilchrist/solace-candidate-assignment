# Summary of Assignment

This was a fun and pretty well thought out interview assignment in my opinion. It left a lot of areas for improvement and was very open ended. I'd imagine the analysis of the assignment allow the reviewer to see where the applicant spent the most time. 2 Hours for a very open ended problem is challenging, but mostly within the conept of "what to focus on first".

My largest critique of myself is that I didn't spend enough time on the database as I would have liked to, but wanted to focus on the front end architecture using tools, frameworks, and libararies that I often use in the stacks I have worked on and find to be "best pratices".

## Database Shortcomings

I found that primarily the data model was simple, but left some room for improvment and I meant to getting around to fixing some things here, but ran out of time here.

### Proper Searching

The application was originally allowing the searching across many columns with the global search filter. First and foremost, allowing an `OR` query across all of those columns with `ILIKE` on a value of `%${value}%` would result in very innefficent access across the table.

I would rather see a smaller subset of columns used in the global filter, but then provided a faceted search experience in the UI by exposing endpoints for

- GET /api/specialties to return a distinct list of spcialties
- GET /api/degress to return a distinct list of degrees

Subsequently, individual columns could be filtered on individually and efficiently increasing the overall performance of the search fuction as we could add indices that would actually be used especially if the query was more of a "startsWith" query as opposed to "contains". A range query could be exposed with min,max values on a column like "Years Of Experience".

> Alternatively, Elastic Search could be used here to handle search here which has better processing for fuzzy and faceted search, but increases some devops complexities.

### Proper Indexing

Given that all of the queries supported are essentially `OR` and `ILIKE` indicies wouldn't help that much, but indicies should still be added on the accessed columns especially if column sorting was provided to the end user. A proper index on columns where sorting and more explicit condintions (i.e., equal, startsWith, and other direct value compariasons) would provide a significant improvement especially when dealing with 100s of thousands of rows.

### Potential Normalizaiton Benefits

I find the structure of storing the "specialities" a bit concerning for long term value. I would prefer to see that the specialties and degrees be broken out into supported values and then those values could be retrieved with a JOIN table. This would make potential faceted option queries easier as the list of options is known ahead of time. Similarly, on specialties a separate column could be used to store the notes (data in the parentheses) allowing a more obvious structure.

### DX Improvement

With hot reloading, the db had issues with too many connections. To get around this it's recommended to setup the following

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  // allow global to have a cached connection in dev
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle> | undefined;
}

const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 1, // adjust as needed
  idle_timeout: 20,
});

export const db = global.db ?? drizzle(queryClient);

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}
```

## UI / UX Improvements

Given the assumption of multiples of 100K values stored in the database it was imperative to implement server side filtering and pagination on the data, but we could provide more functionality with the tables such as:
* sorting
* column filtering
* column visibility; and 
* reordering. 

These are all easily implemented with the tastack/data-table library. Sorting would obviously require backend work to be done as well. 

### Column Filtering

In the long run, a single global filter would not be as performant in the long run and as such I wanted to implement a UI for column filtering.

I have never really been a fan of filters within the column headers, so I was inending to add an advanced dialog (or a collapsible panel above or to the side of the table) that exposes filters for each column allowing a user to specify an explicity value and comparison for each column such as `city=eq:Bonita Springs` or `city=like:Spring`. Then for years of expereince, it have been beneficial to include something like `yearsOfExpereince=min:5,max:10`.

### Tracking Filters / Table State in Query Parameters

I typically like to track things like table state in the query parameters using something like [nuqs](https://nuqs.47ng.com/) so that it's easier for users to share pages by copying a URL that includes the filter parameters. Additionally, it can really help with debugging when a user describes an issue and sends the URL, then an engineer will know what the current filters were at the time the user ran into the issue. 

### Mobile Considerations

Unfortunately, I did not account for mobile layouts in the time window and it should be addressed. For instance, if the window is reduced down to mobile sizes, then the specialties cell does not render well. 

