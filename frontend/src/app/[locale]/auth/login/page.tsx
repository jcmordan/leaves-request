"use client";

import { useState } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("Employee");
  const [email, setEmail] = useState("jdope@refidomsa.com");
  const [name, setName] = useState("John Doe");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a dummy JWT token for development purposes
    const dummyHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const dummyPayload = btoa(JSON.stringify({ 
      sub: "1234567890", 
      name: name,
      email: email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1 day
    }));
    const dummySignature = "dummy-signature";
    const dummyToken = `${dummyHeader}.${dummyPayload}.${dummySignature}`;

    login(dummyToken, {
      id: "usr-" + Math.floor(Math.random() * 10000),
      name,
      email,
      role
    });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-container-low">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in</CardTitle>
            <CardDescription>
              (Development) Mock Active Directory Login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                  <SelectItem value="HR_Admin">HR Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Sign in</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
