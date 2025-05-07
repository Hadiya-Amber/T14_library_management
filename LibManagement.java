import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
public class LibManagement {
	 public static void main(String[] args) {
		 Scanner scanner = new Scanner(System.in);
	        Libraray library = new Libraray();

	        System.out.print("Enter your name: ");
	        Student student = new Student(scanner.nextLine());

	        while (true) {
	            System.out.println("\n===== Library Menu =====");
	            System.out.println("1. Add Book");
	            System.out.println("2. Display All Books");
	            System.out.println("3. Search and Borrow Book");
	            System.out.println("4. Return Book");
	            System.out.println("5. View Borrowed Books");
	            System.out.println("6. Exit");
	            System.out.print("Enter your choice: ");

	            int choice = scanner.nextInt();
	            scanner.nextLine();  // consume newline

	            switch (choice) {
	                case 1:
	                    System.out.print("Enter Book Title: ");
	                    String addTitle = scanner.nextLine();
	                    System.out.print("Enter Author Name: ");
	                    String addAuthor = scanner.nextLine();
	                    library.addBook(addTitle, addAuthor);
	                    break;
	                case 2:
	                    library.displayBooks();
	                    break;
	                case 3:
	                    System.out.print("Enter Book Title to Borrow: ");
	                    String borrowTitle = scanner.nextLine();
	                    System.out.print("Enter Author Name: ");
	                    String borrowAuthor = scanner.nextLine();
	                    Book bookToBorrow = library.searchBook(borrowTitle, borrowAuthor);
	                    if (bookToBorrow != null) {
	                        student.borrowBook(bookToBorrow);
	                    } else {
	                        System.out.println("Book not found.");
	                    }
	                    break;
	                case 4:
	                    System.out.print("Enter Book Title to Return: ");
	                    String returnTitle = scanner.nextLine();
	                    System.out.print("Enter Author Name: ");
	                    String returnAuthor = scanner.nextLine();
	                    Book bookToReturn = library.searchBook(returnTitle, returnAuthor);
	                    if (bookToReturn != null) {
	                        student.returnBook(bookToReturn);
	                    } else {
	                        System.out.println("Book not found.");
	                    }
	                    break;
	                case 5:
	                    student.viewBorrowedBooks();
	                    break;
	                case 6:
	                    System.out.println("Exiting Library System. Goodbye!");
	                    return;
	                default:
	                    System.out.println("Invalid choice! Try again.");
	            }
	        }
	    }
	}

