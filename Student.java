import java.util.*;

public class Student {
    private String name;
    private List<Book> borrowedBooks = new ArrayList<>();

    public Student(String name) {
        this.name = name;
    }

    public void borrowBook(Book book) {
        if (!book.isBorrowed()) {
            book.borrowBook();
            borrowedBooks.add(book);
            System.out.println("Borrowed: " + book.getTitle());
        } else {
            System.out.println("Book is already borrowed.");
        }
    }

    public void returnBook(Book book) {
        if (borrowedBooks.remove(book)) {
            book.returnBook();
            System.out.println("Returned: " + book.getTitle());
        } else {
            System.out.println("You haven't borrowed this book.");
        }
    }

    public void viewBorrowedBooks() {
        if (borrowedBooks.isEmpty()) {
            System.out.println("No books borrowed.");
            return;
        }
        System.out.println("Borrowed Books:");
        for (Book b : borrowedBooks) {
            System.out.println(" - " + b);
        }
    }
}

