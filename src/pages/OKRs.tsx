import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOKRs } from '@/hooks/useOKRs';
import OKRTree from '@/components/okr/OKRTree';
import { Objective, KeyResult } from '@/types/okr';
import { 
  Target, 
  Building, 
  Users, 
  User, 
  Plus,
  ArrowLeft,
  Sparkles,
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const OKRs: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  
  const {
    objectives,
    keyResults,
    loading,
    createObjective,
    updateObjective,
    deleteObjective,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    getObjectivesByLevel,
    getKeyResultsByObjective,
    getOKRHealth,
  } = useOKRs();

  const companyObjectives = getObjectivesByLevel('company');
  const teamObjectives = getObjectivesByLevel('team');
  const individualObjectives = getObjectivesByLevel('individual');

  const handleCreateObjective = async () => {
    const newObjective: Omit<Objective, 'id' | 'created_at' | 'updated_at'> = {
      organization_id: 'org1',
      level: 'company',
      title: 'New Objective',
      description: 'Objective description',
      status: 'active',
      quarter: 'Q1 2024',
      year: 2024,
      confidence: 50,
      progress: 0,
      owner_id: user?.id || 'user1',
    };

    try {
      await createObjective(newObjective);
    } catch (error) {
      console.error('Failed to create objective:', error);
    }
  };

  const handleCreateKeyResult = async (objectiveId: string) => {
    const newKeyResult: Omit<KeyResult, 'id' | 'created_at' | 'updated_at'> = {
      objective_id: objectiveId,
      title: 'New Key Result',
      description: 'Key result description',
      type: 'percentage',
      target_value: 100,
      current_value: 0,
      unit: '%',
      status: 'active',
      confidence: 50,
      progress: 0,
      owner_id: user?.id || 'user1',
    };

    try {
      await createKeyResult(newKeyResult);
    } catch (error) {
      console.error('Failed to create key result:', error);
    }
  };

  const getHealthStats = () => {
    const allObjectives = objectives;
    const onTrack = allObjectives.filter(obj => {
      const health = getOKRHealth(obj.id);
      return health.status === 'on_track';
    }).length;
    const atRisk = allObjectives.filter(obj => {
      const health = getOKRHealth(obj.id);
      return health.status === 'at_risk';
    }).length;
    const offTrack = allObjectives.filter(obj => {
      const health = getOKRHealth(obj.id);
      return health.status === 'off_track';
    }).length;

    return { onTrack, atRisk, offTrack, total: allObjectives.length };
  };

  const healthStats = getHealthStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading OKRs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Vibefy
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{user.full_name || user.email}</span>
                </div>
              )}
              <Button onClick={handleCreateObjective}>
                <Plus className="mr-2 h-4 w-4" />
                New OKR
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">OKRs</h1>
          <p className="text-muted-foreground">
            Track and manage your Objectives and Key Results
          </p>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{healthStats.total}</div>
              <div className="text-sm text-muted-foreground">Total OKRs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{healthStats.onTrack}</div>
              </div>
              <div className="text-sm text-muted-foreground">On Track</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{healthStats.atRisk}</div>
              </div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{healthStats.offTrack}</div>
              </div>
              <div className="text-sm text-muted-foreground">Off Track</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              All OKRs
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Individual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <OKRTree
              objectives={objectives}
              keyResults={keyResults}
              onObjectiveClick={setSelectedObjective}
              onKeyResultClick={setSelectedKeyResult}
              onCreateKeyResult={handleCreateKeyResult}
              getOKRHealth={getOKRHealth}
              showActions={true}
            />
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <OKRTree
              objectives={companyObjectives}
              keyResults={keyResults}
              onObjectiveClick={setSelectedObjective}
              onKeyResultClick={setSelectedKeyResult}
              onCreateKeyResult={handleCreateKeyResult}
              getOKRHealth={getOKRHealth}
              showActions={true}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <OKRTree
              objectives={teamObjectives}
              keyResults={keyResults}
              onObjectiveClick={setSelectedObjective}
              onKeyResultClick={setSelectedKeyResult}
              onCreateKeyResult={handleCreateKeyResult}
              getOKRHealth={getOKRHealth}
              showActions={true}
            />
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <OKRTree
              objectives={individualObjectives}
              keyResults={keyResults}
              onObjectiveClick={setSelectedObjective}
              onKeyResultClick={setSelectedKeyResult}
              onCreateKeyResult={handleCreateKeyResult}
              getOKRHealth={getOKRHealth}
              showActions={true}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OKRs;
