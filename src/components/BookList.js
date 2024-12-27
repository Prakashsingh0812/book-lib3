import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // Assuming the item type is defined here
import '../styles/BookList.css';

const PAGE_SIZE = 6;

const BookList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enlargedBook, setEnlargedBook] = useState(null);

  const fetchBooks = async (term) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://openlibrary.org/search.json?q=${term}`);
      setBooks(response.data.docs);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      fetchBooks(searchTerm);
      setCurrentPage(1);
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      fetchBooks(searchTerm);
      setCurrentPage(1);
    }
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, books]);

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredBooks.slice(start, end);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleBookClick = (book) => {
    setEnlargedBook(book);
  };

  const closeEnlargedBook = () => {
    setEnlargedBook(null);
  };

  const moveBook = (draggedKey, hoverKey) => {
    const updatedBooks = [...books];
    const draggedIndex = updatedBooks.findIndex((book) => book.key === draggedKey);
    const hoverIndex = updatedBooks.findIndex((book) => book.key === hoverKey);

    const [draggedBook] = updatedBooks.splice(draggedIndex, 1);
    updatedBooks.splice(hoverIndex, 0, draggedBook);
    
    setBooks(updatedBooks); 
  };

  return (
    <div className="book-list-container">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-bar"
        />
        <button className="search-icon" onClick={handleSearchClick}>
          <FaSearch />
        </button>
      </div>

      {(loading || filteredBooks.length === 0) && (
        <div className="loading-placeholder">
          <img
            src="https://th.bing.com/th/id/OIP.qFm8YKtySnMyKN8G-b7u4wHaEe?rs=1&pid=ImgDetMain"
            alt="No books found"
            className="loading-image"
          />
        </div>
      )}

      {loading && <p>Loading books...</p>}


      {/* Show 'No books found' if no books match the search term and not loading */}
      {!loading && filteredBooks.length === 0 && searchTerm.trim() && (
        <div className="no-books-found">
          <p>No books found</p>
        </div>
      )}

      {!loading && filteredBooks.length > 0 && (
        <div className="book-list">
          {paginatedBooks.map((book) => (
            <DraggableBook
              key={book.key}
              book={book}
              moveBook={moveBook}
              handleBookClick={handleBookClick}
            />
          ))}
        </div>
      )}

      {enlargedBook && (
        <div className="enlarged-book-modal">
          <div className="modal-content">
            <div className="image-container">
              <span className="close-button" onClick={closeEnlargedBook}>×</span>
              <img
                src={`https://covers.openlibrary.org/b/id/${enlargedBook.cover_i}-L.jpg`}
                alt={enlargedBook.title}
                onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                className="enlarged-book-image"
              />
            </div>
            <h3>{enlargedBook.title}</h3>
            <p>by {enlargedBook.author_name ? enlargedBook.author_name.join(', ') : 'Unknown'}</p>
            <p>{enlargedBook.first_publish_year}</p>
          </div>
        </div>
      )}

      {!loading && filteredBooks.length > 0 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const DraggableBook = ({ book, moveBook, handleBookClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BOOK,
    item: { key: book.key },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.BOOK,
    hover: (item) => {
      if (item.key !== book.key) {
        moveBook(item.key, book.key);
        item.key = book.key;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`book-card ${isDragging ? 'dragging' : ''}`}>
      <img
        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
        alt={book.title}
        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
        onClick={() => handleBookClick(book)}
      />
      <h3>{book.title}</h3>
      <p>by {book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
      <p>{book.first_publish_year}</p>
    </div>
  );
};

export default BookList;
