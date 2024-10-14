import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { decode, sign, verify} from 'hono/jwt'
import { signinInput, signupInput } from "ccommon-medium";



export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string; 
    },
}>

userRouter.post('/signin', async (c) => {
  const databaseUrl = c.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return c.text('DATABASE_URL not found', 500);
  }
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success, error } = signinInput.safeParse(body);
  
  if (!success) {
    return c.json({
      message: "Invalid input",
      errors: error.errors,  // Return validation errors
    }, 400);
  }
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,  // Consider hashing and comparing passwords instead of plain text
      },
    });
    
    if (!user) {
      return c.json({
        message: "Incorrect credentials",
      }, 403);
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    
    return c.json({
      token: jwt,
      message: "Signin successful",
    });
    
  } catch (e) {
    console.error(e);
    return c.text('Failed to signin user', 500);
  } finally {
    await prisma.$disconnect();
  }
});

userRouter.post('/signup', async (c) => {
  const databaseUrl = c.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return c.text('DATABASE_URL not found', 500);
  }
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success, error } = signupInput.safeParse(body);
  console.log(body);
  console.log(error);
  if (!success) {
    return c.json({
      message: "Invalid input",
      errors: error.errors,  // Return validation errors
    }, 400);
  }
  
  try {
    // Create new user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password, 
        name: body.name,
        
        // Consider hashing passwords
      },
    });
    
    // Generate JWT for the new user
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

    return c.json({
      token: jwt,
      message: "Signup successful",
    }, 201);
    
  } catch (e) {
    console.error(e);
    return c.text('Failed to signup user', 500);
  } finally {
    await prisma.$disconnect();
  }
});
