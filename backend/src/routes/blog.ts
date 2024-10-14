import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "ccccommon-medium";

// Define Hono router with types for Bindings and Variables
export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    userId: string; // This allows setting userId in the context
  }
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  console.log("1");
  
  try {
    const user = await verify(authHeader, c.env.JWT_SECRET) as { id: string } | null;
    if (user && typeof user.id === 'string') {
      c.set("userId", user.id);
      await next(); 
    } else {
      return c.json({
        message: "You are not logged in"
      }, 403); 
    }
  } catch (err) {
    console.error(err);
    return c.json({
      message: "Invalid or expired token or you are not logged in"
    }, 403); 
  }
});

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const authorId = c.get("userId");
    const databaseUrl = c.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return c.text('DATABASE_URL not found', 500);
    }
  
    // Validate input using Zod schema (createBlogInput)
    const { success, error } = createBlogInput.safeParse(body);
  
    if (!success) {
      return c.json({
        message: "Invalid input",
        errors: error.errors,  // Send validation errors to the client
      }, 400);
    }
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      const blog = await prisma.post.create({
        data: {
          title: body.title,
          content: body.content,
          authorId: authorId, // Attach the authenticated user as author
        },
      });
  
      return c.json({
        id: blog.id,
        message: "Blog created successfully",
      }, 201);
    } catch (e) {
      console.error(e);
      return c.json({
        message: "Failed to create blog",
      }, 500);
    } finally {
      await prisma.$disconnect();
    }
  });
  
  blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const databaseUrl = c.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return c.text('DATABASE_URL not found', 500);
    }
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    // Validate input using Zod schema (updateBlogInput)
    const { success, error } = updateBlogInput.safeParse(body);
  
    if (!success) {
      return c.json({
        message: "Invalid input",
        errors: error.errors,  // Send validation errors to the client
      }, 400);
    }
  
    try {
      // Check if blog post exists before updating
      const existingBlog = await prisma.post.findUnique({
        where: { id: body.id },
      });
  
      if (!existingBlog) {
        return c.json({
          message: "Blog not found",
        }, 404);
      }
  
      // Update the blog post
      const blog = await prisma.post.update({
        where: { id: body.id },
        data: {
          title: body.title,
          content: body.content,
        },
      });
  
      return c.json({
        blog,
        message: "Blog updated successfully",
      });
    } catch (e) {
      console.error(e);
      return c.json({
        message: "Failed to update blog",
      }, 500);
    } finally {
      await prisma.$disconnect();
    }
  });
  

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const blogs = await prisma.post.findMany();

    return c.json({
        blogs
    })
});

blogRouter.get('/:id', async (c) => {
    const id = await c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try{
        const blog = await prisma.post.findFirst({
            where: {
                id: id
            }},
        )
        return c.json({
            blog
        });
    } catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetchong the blog post"
        })
    }
});

