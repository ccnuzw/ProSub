import { TemplateDataAccess } from '../../core/utils/d1-data-access';
import { Template } from '@shared/types';

// GET /api/templates/[id]
export const onRequestGet = async ({ env, params }) => {
  const template = await TemplateDataAccess.getById(env, params.id as string);
  if (template) {
    return new Response(JSON.stringify(template), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response('Template not found', { status: 404 });
  }
};

// PUT /api/templates/[id]
export const onRequestPut = async ({ request, env, params }) => {
  const { name, description, content } = await request.json() as Partial<Template>;
  const updatedTemplate: Partial<Template> = {
    name,
    description: description || '',
    content,
  };
  const result = await TemplateDataAccess.update(env, params.id as string, updatedTemplate);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE /api/templates/[id]
export const onRequestDelete = async ({ env, params }) => {
  await TemplateDataAccess.delete(env, params.id as string);
  return new Response(null, { status: 204 });
};
