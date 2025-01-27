import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';

import { RepositoryEffects } from './repository.effects';
import { RepositoryService } from '../../repository/services/repository.service';
import {
  fetchRepository,
  fetchRepositorySuccess,
  fetchRepositoryFailure,
  fetchFileContents,
  fetchFileContentsSuccess,
  fetchFileContentsFailure,
} from './repository.actions';
import { FileContents, RepoState } from './repository.state';

describe('RepositoryEffects', () => {
  let actions$: Observable<Action>;
  let effects: RepositoryEffects;
  let repoServiceMock: jasmine.SpyObj<RepositoryService>;

  beforeEach(() => {
    repoServiceMock = jasmine.createSpyObj('RepoService', [
      'getRepositoryInfo',
      'getPullRequestList',
      'getRepositoryContents',
      'getReadmeContent',
      'getFileContents',
    ]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RepositoryService,
          useValue: repoServiceMock,
        },
        RepositoryEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(RepositoryEffects);
  });

  it('should call the repoService and return a success action on a successful call', (done) => {
    actions$ = of(
      fetchRepository({
        owner: 'thisdot',
        repoName: 'starter.dev-github-showcases',
      }),
    );
    const expectedResponseData: RepoState = {
      description: 'A collection of GitHub clone implementations.',
      forkCount: 20,
      issueCount: 30,
      ownerName: 'thisdot',
      prCount: 40,
      readme: 'some readme text',
      repoName: 'starter.dev-github-showcases',
      starCount: 100,
      tags: ['react', 'angular', 'vue', 'github'],
      tree: [],
      openPullRequests: null,
      closedPullRequests: null,
      activeBranch: '',
      selectedFile: null,
      visibility: 'public',
      watchCount: 10,
      website: 'https://starter.dev',
    };

    repoServiceMock.getRepositoryInfo.and.returnValue(of(expectedResponseData));
    repoServiceMock.getPullRequestList.and.returnValue(of(40));
    repoServiceMock.getRepositoryContents.and.returnValue(of([]));
    repoServiceMock.getReadmeContent.and.returnValue(of('some readme text'));

    effects.fetchRepository$.subscribe((action) => {
      expect(action).toEqual(
        fetchRepositorySuccess({ repoData: expectedResponseData }),
      );
      done();
    });
  });

  it('should call the repoService and return a failure action on a failed call', (done) => {
    actions$ = of(
      fetchRepository({
        owner: 'notthisdot',
        repoName: 'null',
      }),
    );

    const expectedError = {
      message: 'error',
    };

    repoServiceMock.getRepositoryInfo.and.returnValue(
      throwError(() => expectedError),
    );

    effects.fetchRepository$.subscribe((action) => {
      expect(action).toEqual(fetchRepositoryFailure({ error: expectedError }));
      done();
    });
  });

  describe('fetchFileContents$', () => {
    it('should dispatch "fetchFileContentsSuccess" action if call to fetch file content is successful', (done) => {
      actions$ = of(
        fetchFileContents({
          owner: 'thisdot',
          repoName: 'starter.dev-github-showcases',
          path: 'README.md',
          commitOrBranchOrTagName: 'main',
        }),
      );

      const expectedResponseData: FileContents = {
        content: 'This is a readme file',
        name: 'starter.dev-github-showcases',
        type: 'file',
        size: 223,
      };

      repoServiceMock.getFileContents.and.returnValue(of(expectedResponseData));

      effects.fetchFileContents$.subscribe((action) => {
        expect(action).toEqual(
          fetchFileContentsSuccess({ fileContents: expectedResponseData }),
        );
        done();
      });
    });

    it('should dispatch "fetchFileContentsFailure" action if call to fetch file content is unsuccessful', (done) => {
      actions$ = of(
        fetchFileContents({
          owner: 'thisdot',
          repoName: 'starter.dev-github-showcases',
          path: 'README.md',
          commitOrBranchOrTagName: 'main',
        }),
      );

      const expectedError = {
        message: 'error',
      };

      repoServiceMock.getFileContents.and.returnValue(
        throwError(() => expectedError),
      );

      effects.fetchFileContents$.subscribe((action) => {
        expect(action).toEqual(
          fetchFileContentsFailure({
            error: expectedError,
          }),
        );
        done();
      });
    });
  });
});
