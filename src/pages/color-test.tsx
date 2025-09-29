import React from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import PageLayout, { PageHeader } from '../components/layout/PageLayout';

export default function ColorTest() {
  return (
    <PageLayout>
      <PageHeader
        title="Primary Color Palette Test"
        description="Testing HeroUI primary color palette implementation"
        icon="lucide:palette"
        iconColor="from-primary-500 to-primary-600"
      />
      
      <div className="space-y-6">
        {/* Primary Color Swatches */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Primary Color Swatches</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 50</p>
                <p className="text-xs text-default-500">#E6F1FE</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 100</p>
                <p className="text-xs text-default-500">#CCE3FD</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-200 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 200</p>
                <p className="text-xs text-default-500">#99C7FB</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-300 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 300</p>
                <p className="text-xs text-default-500">#66AAF9</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-400 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 400</p>
                <p className="text-xs text-default-500">#338EF7</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 500</p>
                <p className="text-xs text-default-500">#006FEE</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 600</p>
                <p className="text-xs text-default-500">#005BC4</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-700 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 700</p>
                <p className="text-xs text-default-500">#004493</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-800 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 800</p>
                <p className="text-xs text-default-500">#002E62</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-900 rounded-lg mb-2 border"></div>
                <p className="text-xs">Primary 900</p>
                <p className="text-xs text-default-500">#001731</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Button Tests */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Button Tests</h3>
            <div className="flex flex-wrap gap-4">
              <Button color="primary" variant="solid">Primary Solid</Button>
              <Button color="primary" variant="bordered">Primary Bordered</Button>
              <Button color="primary" variant="light">Primary Light</Button>
              <Button color="primary" variant="flat">Primary Flat</Button>
              <Button color="primary" variant="shadow">Primary Shadow</Button>
              <Button color="primary" variant="ghost">Primary Ghost</Button>
            </div>
          </CardBody>
        </Card>

        {/* Chip Tests */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Chip Tests</h3>
            <div className="flex flex-wrap gap-4">
              <Chip color="primary" variant="solid">Primary Solid</Chip>
              <Chip color="primary" variant="bordered">Primary Bordered</Chip>
              <Chip color="primary" variant="light">Primary Light</Chip>
              <Chip color="primary" variant="flat">Primary Flat</Chip>
              <Chip color="primary" variant="shadow">Primary Shadow</Chip>
              <Chip color="primary" variant="dot">Primary Dot</Chip>
            </div>
          </CardBody>
        </Card>

        {/* Background Tests */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Background Tests</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg border">
                <p className="text-primary-900">Primary 50 Background</p>
                <p className="text-primary-700">Primary 700 Text</p>
              </div>
              <div className="bg-primary-100 p-4 rounded-lg border">
                <p className="text-primary-900">Primary 100 Background</p>
                <p className="text-primary-800">Primary 800 Text</p>
              </div>
              <div className="bg-primary-500 p-4 rounded-lg">
                <p className="text-foreground">Primary 500 Background</p>
                <p className="text-primary-100">Primary 100 Text</p>
              </div>
              <div className="bg-primary-900 p-4 rounded-lg">
                <p className="text-foreground">Primary 900 Background</p>
                <p className="text-primary-200">Primary 200 Text</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Gradient Tests */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Gradient Tests</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-lg text-foreground">
                <p>Primary 500 to 600 Gradient</p>
              </div>
              <div className="bg-gradient-to-br from-primary-400 to-primary-700 p-4 rounded-lg text-foreground">
                <p>Primary 400 to 700 Gradient</p>
              </div>
              <div className="bg-gradient-to-t from-primary-300 to-primary-500 p-4 rounded-lg text-foreground">
                <p>Primary 300 to 500 Gradient</p>
              </div>
              <div className="bg-gradient-to-bl from-primary-600 to-primary-900 p-4 rounded-lg text-foreground">
                <p>Primary 600 to 900 Gradient</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  );
}
