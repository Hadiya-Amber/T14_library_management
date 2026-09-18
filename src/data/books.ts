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
  /** Book genre */
  genre: string;
  /** Availability flag: true if available to borrow */
  available: boolean;
  /** Publication year */
  year?: number;
}

/** Featured books from Indian literature */
export const BOOKS: Book[] = [
  {
    id: "1",
    title: "The Odyssey",
    author: "Homer",
    cover: "/covers/odyssey.jpg",
    genre: "Epic",
    available: true,
    year: -800,
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "/covers/pride.jpg",
    genre: "Romance",
    available: false,
    year: 1813,
  },
  {
    id: "3",
    title: "Invisible Man",
    author: "Ralph Ellison",
    cover: "/covers/invisible.jpg",
    genre: "Fiction",
    available: true,
    year: 1952,
  },
  {
    id: "4",
    title: "Malgudi Days",
    author: "R.K. Narayan",
    cover: "/covers/malgudi.jpg",
    genre: "Short stories",
    available: true,
    year: 1943,
  },
  {
    id: "5",
    title: "Midnight's Children",
    author: "Salman Rushdie",
    cover: "/covers/midnight.jpg",
    genre: "Magical realism",
    available: false,
    year: 1981,
  },
  {
    id: "6",
    title: "The God of Small Things",
    author: "Arundhati Roy",
    cover: "/covers/god.jpg",
    genre: "Drama",
    available: true,
    year: 1997,
  },
  {
    id: "7",
    title: "Train to Pakistan",
    author: "Khushwant Singh",
    cover: "/covers/train.jpg",
    genre: "Historical fiction",
    available: false,
    year: 1956,
  },
  {
    id: "8",
    title: "The Guide",
    author: "R.K. Narayan",
    cover: "/covers/guide.jpg",
    genre: "Novel",
    available: true,
    year: 1958,
  },
];
