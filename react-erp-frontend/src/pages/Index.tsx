import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  UserCheck, 
  User as UserIcon,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import heroImage from '@/assets/hero-erp.jpg';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Role-Based Access Control",
      description: "Secure access management with Admin, Manager, and Employee roles"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Management",
      description: "Complete user lifecycle management with permissions"
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "Professional Dashboard",
      description: "Clean, intuitive interface designed for business operations"
    }
  ];

  const roles = [
    {
      name: "Admin",
      icon: <Shield className="h-5 w-5" />,
      color: "destructive",
      permissions: ["Create, edit, delete users", "Full system access", "Manage settings"]
    },
    {
      name: "Manager", 
      icon: <UserCheck className="h-5 w-5" />,
      color: "secondary",
      permissions: ["View all employees", "Generate reports", "Assign tasks"]
    },
    {
      name: "Employee",
      icon: <UserIcon className="h-5 w-5" />,
      color: "outline",
      permissions: ["View own profile", "Update personal info", "Submit reports"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-primary">ERP System</h1>
            </div>
            <Link to="/login">
              <Button>
                Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Enterprise Resource Planning System
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your business operations with our comprehensive ERP solution. 
              Secure, scalable, and designed for modern enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-primary shadow-strong">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern technology stack and best practices for enterprise applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

    

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2025 ERP System. Built with React, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
