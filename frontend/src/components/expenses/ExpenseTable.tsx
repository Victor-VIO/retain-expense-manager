import { Badge, Button, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import type { Expense } from '../../types';
import { formatDate, formatMoney, paymentLabels } from '../../utils/format';

interface Props {
  expenses: Expense[];
  onDelete?: (expense: Expense) => void;
}

// Expense rows. On small screens the category, payment and action columns hide;
// tapping the title opens the detail page, which has Edit and Delete.
export default function ExpenseTable({ expenses, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <Table hover responsive className="expense-table mb-0 align-middle">
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th className="d-none d-md-table-cell">Category</th>
          <th className="d-none d-lg-table-cell">Payment</th>
          <th className="text-end">Amount</th>
          {onDelete && <th className="text-end d-none d-sm-table-cell">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            <td className="text-nowrap small">{formatDate(expense.date)}</td>
            <td>
              <Link to={`/expenses/${expense.id}`} className="fw-medium">
                {expense.title}
              </Link>
              <div className="d-md-none small text-muted">{expense.category.name}</div>
            </td>
            <td className="d-none d-md-table-cell">
              <Badge bg="light" text="dark" className="border">
                {expense.category.name}
              </Badge>
            </td>
            <td className="d-none d-lg-table-cell small">{paymentLabels[expense.paymentMethod]}</td>
            <td className="text-end fw-semibold text-nowrap">{formatMoney(expense.amount)}</td>
            {onDelete && (
              <td className="text-end text-nowrap d-none d-sm-table-cell">
                <Button size="sm" variant="link" onClick={() => navigate(`/expenses/${expense.id}/edit`)}>
                  Edit
                </Button>
                <Button size="sm" variant="link" className="text-danger" onClick={() => onDelete(expense)}>
                  Delete
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
