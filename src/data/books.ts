/**
 * Static book data for the featured books shelf.
 *
 * Indian literature titles representing the Indian National Library's collection.
 */

/** Book data structure */
export interface Book {
  /** Unique identifier for the book */
  id: string;
  /** Book title */
  title: string;
  /** Book author */
  author: string;
  /** Cover image URL */
  cover: string;
}

/** Featured books from Indian literature */
export const BOOKS: Book[] = [
  {
    id: "1",
    title: "The Odyssey",
    author: "Homer",
    cover: "/covers/odyssey.jpg",
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "/covers/pride.jpg",
  },
  {
    id: "3",
    title: "Invisible Man",
    author: "Ralph Ellison",
    cover: "/covers/invisible.jpg",
  },
  {
    id: "4",
    title: "Malgudi Days",
    author: "R.K. Narayan",
    cover: "/covers/malgudi.jpg",
  },
  {
    id: "5",
    title: "Midnight's Children",
    author: "Salman Rushdie",
    cover: "/covers/midnight.jpg",
  },
  {
    id: "6",
    title: "The God of Small Things",
    author: "Arundhati Roy",
    cover: "/covers/god.jpg",
  },
  {
    id: "7",
    title: "Train to Pakistan",
    author: "Khushwant Singh",
    cover: "/covers/train.jpg",
  },
  {
    id: "8",
    title: "The Guide",
    author: "R.K. Narayan",
    cover: "/covers/guide.jpg",
  },
];
