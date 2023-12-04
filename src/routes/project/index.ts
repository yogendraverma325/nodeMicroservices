import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import Project from '~/database/model/Project.js';
import authentication from '../../auth/authentication.js';
import authorization from '../../auth/authorization.js';
import { SuccessResponse } from '../../core/ApiResponse.js';
import { RoleCode } from '../../database/model/Role.js';
import ProjectRepo from '../../database/repository/ProjectRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import role from '../../helpers/role.js';
import validator from '../../helpers/validator.js';
import schema from './schema.js';
// import BlogRepo from '../../database/repository/BlogRepo.';
// import task from './task';
// import issue from './issue';
// import BlogCache from '../../cache/repository/BlogCache';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(
  authentication,
  role(RoleCode.ADMIN, RoleCode.LEARNER),
  authorization,
);
/*-------------------------------------------------------------------------*/

router.post(
  '/',
  validator(schema.projectCreate),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const key = `${req.body.title.split(' ')[0][0]}${
      req.body.title.split(' ')[1][0]
    }`;
    const createdProject = await ProjectRepo.create({
      title: req.body.title,
      description: req.body.description,
      draftText: req.body.text,
      scope: req.body.scope,
      projectLead: req.user,
      key,
      //   tags: req.body.tags,
      //   blogUrl: req.body.blogUrl,
      //   imgUrl: req.body.imgUrl,
      //   score: req.body.score,
      createdBy: req.user,
      updatedBy: req.user,
    } as Project);

    new SuccessResponse('Project created successfully', createdProject).send(
      res,
    );
  }),
);

export default router;
// router.use('/writer', writer);
// router.use('/editor', editor);
