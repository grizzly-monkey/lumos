import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { Incident } from '../../types';

interface IncidentCardsProps {
  incidents: Incident[];
}

export const IncidentCards: React.FC<IncidentCardsProps> = ({ incidents }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <CardHeader>
            <CardTitle>{incident.issueType}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{incident.symptoms}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
