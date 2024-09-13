import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect'; // For matchers like toBeInTheDocument
import toast from 'react-hot-toast';
import CreateProduct from './CreateProduct';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';

// Mock axios for API calls
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../context/auth');
jest.mock('../../context/cart');
jest.mock('../../context/search');

describe('CreateProduct Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        useAuth.mockReturnValue([{
            user: { name: 'Admin User', email: 'admin@example.com' },
        }, jest.fn()]);

        useCart.mockReturnValue([[], jest.fn()]);
        useSearch.mockReturnValue([{ keyword: '' }, jest.fn()]);

    });
  it('renders the CreateProduct form', () => {
    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/create-product']}>
            <Routes>
                <Route path="/create-product" element={<CreateProduct />} />
            </Routes>
        </MemoryRouter>);

    // Ensure that the form fields are rendered
    expect(getByPlaceholderText('write a name')).toBeInTheDocument();
    expect(getByPlaceholderText('write a description')).toBeInTheDocument();
    expect(getByPlaceholderText('write a Price')).toBeInTheDocument();
    expect(getByText('CREATE PRODUCT')).toBeInTheDocument();
  });

  it('should submit form data and display success message on product creation', async () => {
    // Mock the successful axios post response
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: 'Product Created Successfully' },
    });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/create-product']}>
            <Routes>
                <Route path="/create-product" element={<CreateProduct />} />
            </Routes>
        </MemoryRouter>);

    // Fill in form inputs
    fireEvent.change(getByPlaceholderText('write a name'), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(getByPlaceholderText('write a description'), {
      target: { value: 'This is a test product' },
    });
    fireEvent.change(getByPlaceholderText('write a Price'), {
      target: { value: '100' },
    });
    fireEvent.change(getByPlaceholderText('write a quantity'), {
      target: { value: '10' },
    });

    // Simulate clicking the create button
    fireEvent.click(getByText('CREATE PRODUCT'));

    // Wait for the axios call and check if the success toast is called
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Product Created Successfully');
  });

  it('should display error message on failed product creation', async () => {
    // Mock the axios post to return an error
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Error creating product' } },
    });

    const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/create-product']}>
            <Routes>
                <Route path="/create-product" element={<CreateProduct />} />
            </Routes>
        </MemoryRouter>);

    // Fill in the form
    fireEvent.change(getByPlaceholderText('write a name'), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(getByPlaceholderText('write a description'), {
      target: { value: 'This is a test product' },
    });
    fireEvent.change(getByPlaceholderText('write a Price'), {
      target: { value: '100' },
    });

    // Click the create button
    fireEvent.click(getByText('CREATE PRODUCT'));

    // Wait for the axios call and check if the error toast is called
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('something went wrong');
  });
});
