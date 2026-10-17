import { Card, Col, Row } from 'react-bootstrap';

// Grey placeholder shapes shown while data loads, so the layout doesn't jump.
export function SkeletonBlock({ height = 16, width = '100%', className = '' }: { height?: number; width?: number | string; className?: string }) {
  return <span className={`skeleton ${className}`} style={{ height, width }} aria-hidden />;
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="tx-item">
          <SkeletonBlock width={40} height={40} className="rounded-3 flex-shrink-0" />
          <div className="flex-grow-1 d-grid gap-2">
            <SkeletonBlock width="55%" height={14} />
            <SkeletonBlock width="35%" height={11} />
          </div>
          <SkeletonBlock width={70} height={14} />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <Row className="g-3 mb-3">
        <Col lg={7}>
          <Card className="h-100">
            <Card.Body className="d-flex gap-4 align-items-center" style={{ minHeight: 260 }}>
              <SkeletonBlock width={150} height={150} className="rounded-circle flex-shrink-0" />
              <div className="flex-grow-1 d-grid gap-3">
                <SkeletonBlock width="40%" />
                <SkeletonBlock width="70%" height={40} />
                <SkeletonBlock width="55%" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Row className="g-3">
            {[0, 1, 2, 3].map((i) => (
              <Col xs={6} key={i}>
                <Card>
                  <Card.Body className="d-grid gap-3" style={{ minHeight: 120 }}>
                    <SkeletonBlock width="60%" height={12} />
                    <SkeletonBlock width="80%" height={22} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      <Card>
        <Card.Body>
          <ListSkeleton rows={4} />
        </Card.Body>
      </Card>
    </div>
  );
}
