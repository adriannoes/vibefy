import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePrioritization } from '@/hooks/usePrioritization';
import RiceScoreCalculator from '@/components/prioritization/RiceScoreCalculator';
import ValueEffortMatrix from '@/components/prioritization/ValueEffortMatrix';
import { RICEScore, ValueEffortMatrix as ValueEffortMatrixType, PrioritizationScore } from '@/types/prioritization';
import { 
  Calculator, 
  BarChart3, 
  Target, 
  ArrowLeft,
  Sparkles,
  User,
  LogOut,
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Prioritization: React.FC = () => {
  const { user, signOut } = useAuth();
  const productId = '1'; // Mock - will be derived from route params
  const [activeTab, setActiveTab] = useState('rice');
  const [selectedItem, setSelectedItem] = useState<PrioritizationScore | null>(null);
  
  const {
    scores,
    sessions,
    loading,
    calculateRICEScore,
    calculateValueEffortMatrix,
    scoreItem,
    getScoresByMethod,
    getTopItems,
    getItemsByQuadrant,
  } = usePrioritization(productId);

  const handleRICEScoreSave = async (score: RICEScore) => {
    if (!selectedItem) return;
    
    try {
      await scoreItem(selectedItem.item_id, selectedItem.item_type, 'rice', score);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to save RICE score:', error);
    }
  };

  const handleValueEffortMove = async (itemId: string, matrix: ValueEffortMatrixType) => {
    try {
      const item = scores.find(s => s.item_id === itemId);
      if (item) {
        await scoreItem(itemId, item.item_type, 'value_effort', matrix);
      }
    } catch (error) {
      console.error('Failed to update value/effort matrix:', error);
    }
  };

  const topItems = getTopItems(10);
  const riceScores = getScoresByMethod('rice');
  const valueEffortScores = getScoresByMethod('value_effort');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prioritization data...</p>
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
                  <User className="h-4 w-4" />
                  <span>{user.full_name || user.email}</span>
                </div>
              )}
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
          <h1 className="text-3xl font-bold mb-2">Feature Prioritization</h1>
          <p className="text-muted-foreground">
            Use data-driven frameworks to prioritize features and initiatives
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rice" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              RICE Scoring
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Value/Effort Matrix
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* RICE Scoring Tab */}
          <TabsContent value="rice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiceScoreCalculator
                onScoreChange={(score) => {
                  // Update selected item with new score
                  if (selectedItem) {
                    setSelectedItem({
                      ...selectedItem,
                      rice_score: score,
                    });
                  }
                }}
                onSave={handleRICEScoreSave}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>RICE Scores</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Items ranked by RICE score
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riceScores.length > 0 ? (
                      riceScores.map((score, index) => (
                        <div
                          key={score.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedItem?.id === score.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedItem(score)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{score.item_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {score.rice_score?.reach} × {score.rice_score?.impact} × {score.rice_score?.confidence}% ÷ {score.rice_score?.effort}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {score.rice_score?.score || 0}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                #{score.rank}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calculator className="h-8 w-8 mx-auto mb-2" />
                        <p>No RICE scores yet</p>
                        <p className="text-sm">Select an item to calculate its RICE score</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Value/Effort Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <ValueEffortMatrix
              items={valueEffortScores}
              onItemMove={handleValueEffortMove}
              onItemClick={setSelectedItem}
            />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Priority Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Priority Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topItems.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{item.rank}
                          </Badge>
                          <div>
                            <div className="font-medium">{item.item_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.method.toUpperCase()} Score
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {item.rice_score?.score || item.custom_score || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Wins */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Quick Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getItemsByQuadrant('quick_wins').slice(0, 5).map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{item.item_id}</div>
                        <div className="text-sm text-muted-foreground">
                          High value, low effort
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{scores.length}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getItemsByQuadrant('quick_wins').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Quick Wins</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getItemsByQuadrant('major_projects').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Major Projects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {getItemsByQuadrant('questionable').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Questionable</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Prioritization;
