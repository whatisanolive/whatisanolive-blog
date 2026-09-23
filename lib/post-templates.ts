import type { Category } from "@prisma/client";

/**
 * Starting points for new posts, picked in the editor on /admin/posts/create.
 *
 * Edit freely: add a template by adding an entry here. `category` is
 * pre-selected in the form when the template is applied. Text in _italics_ is
 * a prompt to replace; everything else is structure worth keeping.
 */
export type PostTemplate = {
  id: string;
  label: string;
  description: string;
  category: Category;
  content: string;
};

const dsaProblem = `There is exactly one idea you need for this one:

> **_The key insight, in one sentence. If a reader remembers nothing else, it should be this._**

_Why this problem is interesting, or where it trips people up. Two or three sentences._

## The problem

_State the problem plainly. Include a small example:_

\`\`\`plaintext
Input:  [3, 1, 2]
Output: [1, 2, 3]
\`\`\`

## Brute force first

_The obvious approach, and why it's too slow._

\`\`\`python
def solve(arr):
    # brute force
    pass
\`\`\`

| Time | Space |
| ---- | ----- |
| O(n²) | O(1) |

## The better approach

_The pattern or invariant that makes this fast. Walk through it on the example above._

\`\`\`python
def solve(arr):
    # optimised
    pass
\`\`\`

| Time | Space |
| ---- | ----- |
| O(n log n) | O(n) |

_Where the space goes, and when the worst case actually happens._

> **Watch out:** _the edge case or off-by-one that breaks naive implementations (empty input, duplicates, a single element, overflow…)._

## Edge cases

- _Empty input_
- _All elements equal_
- _Already sorted / reverse sorted_

## In an interview

_The one-sentence version of the trade-off you'd say out loud, and the follow-up question to expect._
`;

const techDeepDive = `_The hook: the misconception this post corrects, or the question it answers. Two or three sentences that make someone keep reading._

## The short version

- _Point one_
- _Point two_
- _Point three_

## How it actually works

_The mechanism, step by step. Name the moving parts._

\`\`\`ts
// A minimal example that shows the behaviour
\`\`\`

_What the example prints, and why:_

\`\`\`plaintext
output here
\`\`\`

## Where it goes wrong

_The failure mode people hit in production, and how to spot it._

\`\`\`ts
// The problematic version
\`\`\`

> **Watch out:** _the one setting, default or assumption that bites people._

## Doing it right

\`\`\`ts
// The fixed version
\`\`\`

## What to take away

- _Takeaway one_
- _Takeaway two_
- _Takeaway three_

_A closing paragraph that ties it together: once you understand X, Y stops being a mystery._
`;

const essay = `_Open with a scene, a claim, or a question. The first paragraph is shown larger, so make it count._

## _The first idea_

_Develop it. Essays read best in short paragraphs._

## _The turn_

_Where your thinking changed, or the thing you noticed that others miss._

> _A line worth quoting._

## _What it means_

_Bring it back to the reader: why this matters beyond your own experience._

---

_A short closing thought._
`;

const bookNotes = `_One paragraph: what the book is about, and why you picked it up._

## The big idea

> **_The book's core argument, in your own words._**

## Notes worth keeping

- _Idea, with a page or chapter reference_
- _Idea_
- _Idea_

## Where I disagree

_What the author gets wrong, oversimplifies or leaves out._

## Would I recommend it?

_Who should read it, and who can skip it._
`;

export const POST_TEMPLATES: PostTemplate[] = [
  {
    id: "dsa-problem",
    label: "DSA problem",
    description: "Key insight, brute force, better approach, complexity, edge cases",
    category: "DSA",
    content: dsaProblem,
  },
  {
    id: "tech-deep-dive",
    label: "Tech deep-dive",
    description: "Hook, how it works, where it goes wrong, takeaways",
    category: "TECH",
    content: techDeepDive,
  },
  {
    id: "essay",
    label: "Essay",
    description: "Opening, three sections, closing thought",
    category: "BLANK_CANVAS",
    content: essay,
  },
  {
    id: "book-notes",
    label: "Book notes",
    description: "Big idea, notes, disagreements, verdict",
    category: "BLANK_CANVAS",
    content: bookNotes,
  },
];
