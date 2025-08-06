import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tool Not Found</h1>
        <p className="text-muted-foreground">
          The requested tool doesn't have any test data in our community database
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle>Tool Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This tool hasn't been tested by the AgentProbe community yet, or the tool name might be incorrect.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Available tools include:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• git - Version control operations</li>
                <li>• docker - Container management</li>
                <li>• vercel - Deployment and hosting</li>
                <li>• netlify - JAMstack deployments</li>
                <li>• wrangler - Cloudflare Workers</li>
                <li>• gh - GitHub CLI operations</li>
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <Button asChild variant="default">
                <Link href="/leaderboard" className="flex items-center space-x-2">
                  <span>View All Tools</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}