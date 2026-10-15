import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="md" className="app-navbar" variant="dark" collapseOnSelect>
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="fw-bold">
          Retain
        </Navbar.Brand>
        {user && (
          <>
            <Navbar.Toggle aria-controls="main-nav" />
            <Navbar.Collapse id="main-nav">
              <Nav className="me-auto">
                <Nav.Link as={NavLink} to="/" end eventKey="dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/expenses" eventKey="expenses">
                  Expenses
                </Nav.Link>
                <Nav.Link as={NavLink} to="/budget" eventKey="budget">
                  Budget
                </Nav.Link>
                {isAdmin && (
                  <Nav.Link as={NavLink} to="/admin" eventKey="admin">
                    Admin
                  </Nav.Link>
                )}
              </Nav>
              <div className="d-flex align-items-center gap-2 py-2 py-md-0">
                <span className="text-white-50 small">
                  {user.name}
                  {isAdmin && (
                    <Badge bg="light" text="dark" className="ms-2">
                      admin
                    </Badge>
                  )}
                </span>
                <Button size="sm" variant="outline-light" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
}
