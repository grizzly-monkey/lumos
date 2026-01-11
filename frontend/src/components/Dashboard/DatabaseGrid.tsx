import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { StatusIndicator } from '../shared/StatusIndicator';
import type { Database } from '../../types';

interface DatabaseGridProps {
  databases: Database[];
}

export const DatabaseGrid = ({ databases }: DatabaseGridProps) => {
  if (!databases.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No databases found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {databases.map((db) => (
        <Card key={db.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate" title={db.name}>
              {db.name}
            </CardTitle>
            <StatusIndicator status={db.status} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
