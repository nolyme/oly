import { Exception, Kernel } from "oly-core";
import { field, ValidationException } from "oly-json";
import { Repository } from "../src/services/Repository";

describe("DatabaseProvider", () => {

  class CommentLike {
    @field personId: number;
    @field value: number;
  }

  class Comment {
    // querying personId is impossible here
    @field personId: number;
    @field content: string;
    @field({
      type: Array,
      of: CommentLike,
      default: [],
    }) likes: CommentLike[];
  }

  class Person {
    @field id: number;
    @field name: string;
  }

  class Post {
    @field id: number;
    @field title: string;
    @field content: string;
    @field authorId: number;

    // comment could be embedded
    @field({
      type: Array,
      of: Comment,
      default: [],
    }) comments: Comment[];
  }

  class GandalfException extends Exception {
    message = "You Shall Not Pass!";
  }

  /**
   * Create a table and each @field will be a column
   */
  class PostRepository extends Repository.of(Post) {

    async onBeforeInsert(e: Post) {
      if (e.title === "Hello") {
        throw new GandalfException();
      }
    }
  }

  class PersonRepository extends Repository.of(Person) {
  }

  const kernel = Kernel.create();
  const postRepository = kernel.inject(PostRepository);
  const personRepository = kernel.inject(PersonRepository);

  it("should synchronise schema", async () => {
    await personRepository.clear();
    await postRepository.clear();

    const jean = await personRepository.insert({
      name: "Jean",
    });

    const post1 = await postRepository.insert({
      authorId: jean.id,
      title: "Yolo",
      content: "Blah blah ...",
    });

    const troll = await personRepository.insert({
      name: "Troll",
    });

    const post1v1 = await postRepository.findOneById(post1.id);
    if (!post1v1) {
      throw new Error("nop");
    }
    post1v1.comments.push({
      personId: troll.id,
      content: "this is shit",
      likes: [],
    });

    await postRepository.save(post1v1); // TODO: lock __v

    const post1v2 = await postRepository.findOneById(post1.id);
    if (!post1v2) {
      throw new Error("nop");
    }
    post1v2.comments[0].likes.push({
      personId: jean.id,
      value: -1,
    });

    await postRepository.save(post1v2);

    expect(await postRepository.find()).toEqual([{
      id: 1,
      title: "Yolo",
      content: "Blah blah ...",
      authorId: 1,
      comments: [{
        personId: 2,
        likes: [{
          personId: 1,
          value: -1,
        }],
        content: "this is shit",
      }],
    }]);
  });

  it("should stop insert if exception", async () => {
    await postRepository.clear();
    await expect(postRepository.insert({
      title: "Hello",
      content: "Blah",
      authorId: 1,
    }))
      .rejects
      .toEqual(new Exception("You Shall Not Pass!"));
  });

  it("should reject bad data with jsonschema", async () => {
    await postRepository.clear();
    await expect(postRepository.insert({}))
      .rejects
      .toEqual(new ValidationException("data should have required property 'title'", []));
  });
});
