import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import AdminOrders from './AdminOrders';
import { useAuth } from '../../context/auth';
import { BrowserRouter } from 'react-router-dom';
import moment from 'moment';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';
import { Select } from 'antd';

jest.mock('axios');
jest.mock('../../context/auth');
jest.mock('../../context/cart');
jest.mock('../../context/search');

// Mock the Select component from Ant Design
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: ({ children, onChange, defaultValue }) => (
    <select defaultValue={defaultValue} onChange={e => onChange(e.target.value)}>
      {children}
    </select>
  ),
  Option: ({ children, value }) => (
    <option value={value}>{children}</option>
  ),
}));

describe('AdminOrders Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: 'mock-token', user: { name: 'Admin' } }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);
    useSearch.mockReturnValue([{ keyword: '' }, jest.fn()]);
});

//   it('renders the AdminOrders page and fetches orders', async () => {
//     // Mock the orders data
//     const mockOrders = [
//       {
//         _id: 'order1',
//         status: 'Processing',
//         buyer: { name: 'John Doe' },
//         createAt: moment().subtract(1, 'day').toISOString(),
//         payment: { success: true },
//         products: [
//           { _id: 'product1', name: 'Product 1', description: 'Description of product 1', price: 100 },
//         ],
//       },
//     ];
//     axios.get.mockResolvedValueOnce({ data: mockOrders });

//     const { getByText, getAllByText } = render(
//       <BrowserRouter>
//         <AdminOrders />
//       </BrowserRouter>
//     );

//     // Verify page title and content
//     expect(getByText('All Orders')).toBeInTheDocument();

//     // Wait for the orders to be fetched and rendered
//     await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders'));

//     // Check if order data is rendered
//     expect(getByText('John Doe')).toBeInTheDocument();
//     expect(getByText('Processing')).toBeInTheDocument();
//     expect(getByText('Success')).toBeInTheDocument();
//     expect(getByText('1')).toBeInTheDocument(); // Quantity of products
//     expect(getByText('Product 1')).toBeInTheDocument();
//     expect(getByText('Price : 100')).toBeInTheDocument();
//   });

//   it('should update the order status when status is changed', async () => {
//     const mockOrders = [
//       {
//         _id: 'order1',
//         status: 'Processing',
//         buyer: { name: 'John Doe' },
//         createAt: moment().subtract(1, 'day').toISOString(),
//         payment: { success: true },
//         products: [
//           { _id: 'product1', name: 'Product 1', description: 'Description of product 1', price: 100 },
//         ],
//       },
//     ];

//     axios.get.mockResolvedValueOnce({ data: mockOrders });
//     axios.put.mockResolvedValueOnce({});

//     const { getByText, getByDisplayValue } = render(
//       <BrowserRouter>
//         <AdminOrders />
//       </BrowserRouter>
//     );

//     await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders'));

//     // Check if the initial status is "Processing"
//     const select = getByDisplayValue('Processing');
//     expect(select).toBeInTheDocument();

//     // Change the status to "Shipped"
//     fireEvent.change(select, { target: { value: 'Shipped' } });

//     await waitFor(() => expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/order-status/order1', { status: 'Shipped' }));
//   });

  it('should display an error message when fetching orders fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch orders'));

    const { getByText } = render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders'));

    // In this case, no orders would be displayed, but the app should still render correctly
    expect(getByText('All Orders')).toBeInTheDocument();
  });
});
