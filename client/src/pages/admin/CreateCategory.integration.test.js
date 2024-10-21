import React from 'react';
import { render, fireEvent, waitFor, screen, within } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import CreateCategory from './CreateCategory';
import { useAuth } from '../../context/auth';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/auth';
import { CartProvider } from '../../context/cart';
import { SearchProvider } from '../../context/search';

jest.mock('axios');
jest.mock('react-hot-toast');

// jest.mock('../../context/auth');
// jest.mock('../../context/cart');
// jest.mock('../../context/search');

describe('CreateCategory Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock useAuth to return valid values
        // useAuth.mockReturnValue([{
        //     user: { name: 'Admin User', email: 'admin@example.com' },
        // }, jest.fn()]);

        // // Mock useCart to return an empty cart
        // useCart.mockReturnValue([[], jest.fn()]);

        // // Mock useSearch to return an empty search keyword
        // useSearch.mockReturnValue([{ keyword: '' }, jest.fn()]);

    });

    it('renders the CreateCategory page with Header.js dependencies', () => {
        localStorage.setItem('auth', JSON.stringify({
            user: { name: 'John Doe', email: 'admin@example.com' },
            token: 'some-token',
        }));
        localStorage.setItem('cart', JSON.stringify([]));
        localStorage.setItem('search', JSON.stringify({ keyword: 'orange' }));

        const { getByText, getByPlaceholderText } = render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter initialEntries={['/create-category']}>
                            <Routes>
                                <Route path="/create-category" element={<CreateCategory />} />
                            </Routes>
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>);

        expect(getByText('Manage Category')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter new category')).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        expect(getByText('John Doe')).toBeInTheDocument();

    });
});