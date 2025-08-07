import { TemplateDataAccess } from '../core/utils/d1-data-access';
import { v4 as uuidv4 } from 'uuid';
import { Template } from '@shared/types';

// GET /api/templates
export const onRequestGet = async ({ env }) => {
  const templates = await TemplateDataAccess.getAll(env);
  return new Response(JSON.stringify(templates), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST /api/templates
export const onRequestPost = async ({ request, env }) => {
  const { name, description, clientType, content } = await request.json() as Template;
  const newTemplate: Template = {
    id: uuidv4(),
    name,
    description: description || '',
    clientType,
    content,
  };
  const createdTemplate = await TemplateDataAccess.create(env, newTemplate);
  return new Response(JSON.stringify(createdTemplate), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
