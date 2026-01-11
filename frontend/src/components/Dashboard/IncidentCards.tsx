import React from 'react';
import { Card, CardContent } from '../shared/Card';
import { Incident } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { AlertOctagon, AlertTriangle, Activity, Database, Clock, CheckCircle2, Wrench } from 'lucide-react';

interface IncidentCardsProps {
  incidents: Incident[];
}

export const IncidentCards: React.FC<IncidentCardsProps> = ({ incidents }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('cpu')) return <Activity className="w-4 h-4" />;
    if (type.includes('memory')) return <Database className="w-4 h-4" />;
    if (type.includes('query')) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {incidents.map((incident) => (
        <Card key={incident.id} className={`border-slate-800 bg-slate-950/50 transition-colors ${incident.status === 'resolved' ? 'border-green-900/30 bg-green-950/10' : 'hover:bg-slate-900/50'}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-md border ${getSeverityColor(incident.severity)}`}>
                  {getIcon(incident.issueType)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {incident.issueType.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Database className="w-3 h-3 mr-1" />
                    <span>{(incident as any).database?.name || 'Unknown DB'}</span>
                    <span className="mx-1.5">•</span>
                    <span>{formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
              {incident.symptoms}
            </p>

            {/* Resolution Section */}
            {incident.status === 'resolved' ? (
              <div className="mt-3 pt-3 border-t border-green-900/30">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-bold text-green-400 uppercase">Resolved</span>
                </div>
                {incident.fixApplied && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Wrench className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-300 font-mono bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-900/50">
                      {incident.fixApplied}
                    </span>
                  </div>
                )}
                {incident.resolutionNotes && (
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    "{incident.resolutionNotes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 flex justify-between items-center">
                 <span className={`text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase`}>
                  {incident.status}
                </span>
                <span className="text-[10px] text-blue-400 animate-pulse flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  AI Analyzing...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
