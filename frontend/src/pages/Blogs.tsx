import { useEffect } from "react";
import { Appbar } from "../components/AppBar";
import { BlogCard } from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkelton";
import { useBlogs } from "../hooks/index";

export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    useEffect(() => {   
        console.log("blog", blogs)
    }, []);

    if (loading) {
        return <div>
            <Appbar /> 
            <div  className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }

    return <div>
        <Appbar />
        <div  className="flex justify-center">
            <div>
                {blogs.map(blog => <BlogCard
                    id={blog.id}
                    authorName={blog?.author?.name || "Anonymous"}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={"2nd Feb 2024"}
                />)}
            </div>
        </div>
    </div>
}