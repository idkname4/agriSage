import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MockAnalysis = {
  id: string;
  image: (typeof PlaceHolderImages)[0];
  plantType: string;
  issue: string;
  severity: 'Low' | 'Medium' | 'High';
  confidence: string;
  status: 'Reviewed' | 'Pending';
};

const mockData: MockAnalysis[] = [
  {
    id: '1',
    image: PlaceHolderImages.find(img => img.id === 'leaf-1')!,
    plantType: 'Tomato',
    issue: 'Early Blight',
    severity: 'Medium',
    confidence: '85%',
    status: 'Pending',
  },
  {
    id: '2',
    image: PlaceHolderImages.find(img => img.id === 'leaf-2')!,
    plantType: 'Corn',
    issue: 'Nitrogen Deficiency',
    severity: 'Low',
    confidence: '92%',
    status: 'Reviewed',
  },
  {
    id: '3',
    image: PlaceHolderImages.find(img => img.id === 'leaf-4')!,
    plantType: 'Mango',
    issue: 'Anthracnose',
    severity: 'High',
    confidence: '78%',
    status: 'Pending',
  },
    {
    id: '4',
    image: PlaceHolderImages.find(img => img.id === 'leaf-3')!,
    plantType: 'Potato',
    issue: 'Healthy',
    severity: 'Low',
    confidence: '98%',
    status: 'Reviewed',
  },
];

export default function DashboardPage() {
  if (PlaceHolderImages.length < 4 || mockData.some(item => !item.image)) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Loading dashboard data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Plant Type</TableHead>
              <TableHead>Identified Issue</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.image.imageUrl}
                    alt={item.image.description}
                    width={64}
                    height={48}
                    className="rounded-md object-cover"
                    data-ai-hint={item.image.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.plantType}</TableCell>
                <TableCell>{item.issue}</TableCell>
                <TableCell>
                  <Badge variant={item.severity === 'High' ? 'destructive' : item.severity === 'Medium' ? 'default' : 'secondary'}>
                    {item.severity}
                  </Badge>
                </TableCell>
                <TableCell>{item.confidence}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'Pending' ? 'outline' : 'secondary'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    {item.status === 'Pending' ? 'Review' : 'View'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
