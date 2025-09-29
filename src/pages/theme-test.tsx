import React from "react";
import { Card, CardBody, Button, Chip, Switch } from "@heroui/react";
import PageLayout, { PageHeader } from "../components/layout/PageLayout";
import { useTheme } from "../contexts/theme-context";

export default function ThemeTest() {
  const { theme, toggleTheme } = useTheme();

  return (
    <PageLayout>
      <PageHeader
        title="Theme Test Page"
        description="Test HeroUI theme colors and dark mode functionality"
        icon="lucide:palette"
        actions={
          <div className="flex items-center gap-4">
            <span className="text-default-600">Current: {theme}</span>
            <Switch
              isSelected={theme === 'dark'}
              onValueChange={toggleTheme}
              color="primary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <span className={`${className} text-warning`}>🌙</span>
                ) : (
                  <span className={`${className} text-warning`}>☀️</span>
                )
              }
            />
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Primary Colors */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Primary Colors</h3>
            <div className="space-y-3">
              <Button color="primary" className="w-full">Primary Button</Button>
              <Chip color="primary">Primary Chip</Chip>
              <div className="p-3 bg-primary-100 text-primary-800 rounded-lg">
                Primary Background
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Success Colors */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Success Colors</h3>
            <div className="space-y-3">
              <Button color="success" className="w-full">Success Button</Button>
              <Chip color="success">Success Chip</Chip>
              <div className="p-3 bg-success-100 text-success-800 rounded-lg">
                Success Background
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Warning Colors */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Warning Colors</h3>
            <div className="space-y-3">
              <Button color="warning" className="w-full">Warning Button</Button>
              <Chip color="warning">Warning Chip</Chip>
              <div className="p-3 bg-warning-100 text-warning-800 rounded-lg">
                Warning Background
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Danger Colors */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Danger Colors</h3>
            <div className="space-y-3">
              <Button color="danger" className="w-full">Danger Button</Button>
              <Chip color="danger">Danger Chip</Chip>
              <div className="p-3 bg-danger-100 text-danger-800 rounded-lg">
                Danger Background
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Secondary Colors */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Secondary Colors</h3>
            <div className="space-y-3">
              <Button color="secondary" className="w-full">Secondary Button</Button>
              <Chip color="secondary">Secondary Chip</Chip>
              <div className="p-3 bg-secondary-100 text-secondary-800 rounded-lg">
                Secondary Background
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Default Colors */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Default Colors</h3>
            <div className="space-y-3">
              <Button color="default" className="w-full">Default Button</Button>
              <Chip color="default">Default Chip</Chip>
              <div className="p-3 bg-default-100 text-default-800 rounded-lg">
                Default Background
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Background Test */}
      <div className="mt-8">
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold text-foreground mb-4">Background Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-background border border-divider rounded-lg text-center">
                <p className="text-foreground font-medium">Background</p>
              </div>
              <div className="p-4 bg-content1 border border-divider rounded-lg text-center">
                <p className="text-foreground font-medium">Content 1</p>
              </div>
              <div className="p-4 bg-content2 border border-divider rounded-lg text-center">
                <p className="text-foreground font-medium">Content 2</p>
              </div>
              <div className="p-4 bg-content3 border border-divider rounded-lg text-center">
                <p className="text-foreground font-medium">Content 3</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  );
}
