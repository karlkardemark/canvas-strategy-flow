import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Calendar, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  type: "BMC" | "VPC";
  lastModified: string;
  collaborators: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({
  title,
  description,
  type,
  lastModified,
  collaborators,
  onOpen,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <Card className="group hover:shadow-medium transition-all duration-200 cursor-pointer border-canvas-border bg-canvas-area">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 flex-1" onClick={onOpen}>
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent onClick={onOpen} className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-xs font-medium">
              {type}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              {collaborators}
            </div>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {lastModified}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}