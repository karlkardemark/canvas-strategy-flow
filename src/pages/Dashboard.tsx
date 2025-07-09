import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Layout, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  type: "BMC" | "VPC";
  lastModified: string;
  collaborators: number;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "SaaS Product Canvas",
      description: "Business model for our new SaaS platform targeting small businesses",
      type: "BMC",
      lastModified: "2 hours ago",
      collaborators: 3,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Mobile App Value Prop",
      description: "Value proposition analysis for our fitness tracking mobile application",
      type: "VPC",
      lastModified: "1 day ago",
      collaborators: 2,
      createdAt: "2024-01-14",
    },
    {
      id: "3",
      title: "E-commerce Strategy",
      description: "Complete business model for our new e-commerce venture",
      type: "BMC",
      lastModified: "3 days ago",
      collaborators: 5,
      createdAt: "2024-01-12",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    type: "BMC" as "BMC" | "VPC",
  });

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (!newProject.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    const project: Project = {
      id: `project-${Date.now()}`,
      title: newProject.title,
      description: newProject.description,
      type: newProject.type,
      lastModified: "Just now",
      collaborators: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProjects(prev => [project, ...prev]);
    setNewProject({ title: "", description: "", type: "BMC" });
    setIsCreateDialogOpen(false);
    toast.success("Project created successfully!");
  };

  const handleOpenProject = (project: Project) => {
    if (project.type === "BMC") {
      navigate(`/canvas/${project.id}`);
    } else {
      navigate(`/value-proposition/${project.id}`);
    }
  };

  const handleEditProject = (project: Project) => {
    toast.info("Edit functionality coming soon!");
  };

  const handleDeleteProject = (project: Project) => {
    setProjects(prev => prev.filter(p => p.id !== project.id));
    toast.success("Project deleted successfully");
  };

  return (
    <div className="min-h-screen bg-workspace">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Business Canvas Studio</h1>
          <p className="text-xl text-muted-foreground">
            Create and manage your Business Model and Value Proposition canvases
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new Business Model Canvas or Value Proposition Canvas project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Canvas Type</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value: "BMC" | "VPC") => setNewProject(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BMC">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4" />
                          Business Model Canvas
                        </div>
                      </SelectItem>
                      <SelectItem value="VPC">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Value Proposition Canvas
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Layout className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Create your first Business Model or Value Proposition Canvas"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onOpen={() => handleOpenProject(project)}
                onEdit={() => handleEditProject(project)}
                onDelete={() => handleDeleteProject(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}