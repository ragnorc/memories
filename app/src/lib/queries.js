import { gql } from "react-apollo";

export const FEED_QUERY2 = gql`
  query FeedQuery($cursor: String) {
    user {
      id
      feed(
        orderBy: updatedAt_DESC
        first: 8
        after: $cursor
        filter: { published: true }
      ) {
        id
        title
        likedBy {
          id
        }
        _likedByMeta {
          count
        }
        startedAt
        endedAt
        updatedAt
        createdAt
        songs
        location
        images {
          id
          url
          secret
        }
        collaborators {
          id
          fullName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const FEED_QUERY = gql`
  query FeedQuery($cursor: String, $userID: ID!) {
    feed: allMemories(
      orderBy: id_DESC
      first: 8
      after: $cursor
      filter: {
        AND: [
          { published: true }
          { showInFeed: true }
          { isChildMemory: false }
          {
            OR: [
              { collaborators_some: { id: $userID } }
              { initiator: { id: $userID } }
              {
                AND: [
                  {
                    OR: [
                      {
                        collaborators_some: { followers_some: { id: $userID } }
                      }
                      { initiator: { followers_some: { id: $userID } } }
                    ]
                  }
                  {
                    OR: [
                      { privacyType: "everybody" }
                      { privacyType: "onlyFollowers" }
                      {
                        OR: [
                          { specificFollowers_some: { id: $userID } }
                          { specificGroup: { members_some: { id: $userID } } }
                        ]
                      }
                    ]
                  }
                  { excludedPeople_every: { id_not: $userID } }
                ]
              }
            ]
          }
        ]
      }
    ) {
      id
      title
      startedAt
      endedAt
      updatedAt
      createdAt
      description
      songs
      location
      headerImage {
        id
        url
        secret
        size
      }
      images {
        id
        url
        secret
        size
      }
      collaborators {
        id
        fullName
        profileImage {
          id
          url
          secret
        }
      }
      initiator {
        id
        fullName
        profileImage {
          id
          url
          secret
        }
      }
      childMemories {
        id
        title
        startedAt
        endedAt
        updatedAt
        createdAt
        description
        songs
        location
        images {
          id
          url
          secret
          size
        }
        collaborators {
          id
          fullName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const PROFILE_QUERY = gql`
  query ProfileQuery($profileUserID: ID!) {
    User(id: $profileUserID) {
      id
      fullName
      userName
      oneSignalID
      email
      auth0UserId
      followers {
        id
        fullName
        userName
      }
      following {
        id
        fullName
        userName
      }
      profileImage {
        id
        url
        secret
      }
      _followersMeta {
        count
      }
      _followingMeta {
        count
      }
    }
  }
`;

export const PROFILE_MEMORIES_QUERY = gql`
  query ProfileMemoriesQuery($userID: ID!, $profileUserID: ID!) {
    memories: allMemories(
      orderBy: endedAt_DESC
      filter: {
        AND: [
          { published: true }
          {
            OR: [
              { initiator: { id: $profileUserID } }
              { collaborators_some: { id: $profileUserID } }
            ]
          }
          { isChildMemory: false }
          {
            OR: [
              { collaborators_some: { id: $userID } }
              { initiator: { id: $userID } }
              {
                AND: [
                  {
                    OR: [
                      { privacyType: "everybody" }
                      { privacyType: "onlyFollowers" }
                      {
                        OR: [
                          { specificFollowers_some: { id: $userID } }
                          { specificGroup: { members_some: { id: $userID } } }
                        ]
                      }
                    ]
                  }
                  { excludedPeople_every: { id_not: $userID } }
                ]
              }
            ]
          }
        ]
      }
    ) {
      id
      title
      startedAt
      endedAt
      updatedAt
      createdAt
      description
      songs
      location
      headerImage {
        id
        url
        secret
        size
      }
      images {
        id
        url
        secret
        size
      }
      collaborators {
        id
        fullName
        profileImage {
          id
          url
          secret
        }
      }
      initiator {
        id
        fullName
        profileImage {
          id
          url
          secret
        }
      }
      childMemories {
        id
        title
        startedAt
        endedAt
        updatedAt
        createdAt
        description
        songs
        location
        images {
          id
          url
          secret
          size
        }
        collaborators {
          id
          fullName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const SUBSCRIPTION_QUERY = gql`
  subscription($userID: ID!) {
    Memory(
      filter: {
        AND: [
          { published: true }
          { showInFeed: true }
          { isChildMemory: false }
          {
            OR: [
              { collaborators_some: { id: $userID } }
              { initiator: { id: $userID } }
              {
                AND: [
                  {
                    OR: [
                      {
                        collaborators_some: { followers_some: { id: $userID } }
                      }
                      { initiator: { followers_some: { id: $userID } } }
                    ]
                  }
                  {
                    OR: [
                      { privacyType: "everybody" }
                      { privacyType: "onlyFollowers" }
                      {
                        OR: [
                          { specificFollowers_some: { id: $userID } }
                          { specificGroup: { members_some: { id: $userID } } }
                        ]
                      }
                    ]
                  }
                  { excludedPeople_every: { id_not: $userID } }
                ]
              }
            ]
          }
        ]
      }
    ) {
      node {
        id
        title
        likedBy {
          id
        }
        _likedByMeta {
          count
        }
        published
        startedAt
        endedAt
        updatedAt
        createdAt
        songs
        location
        images {
          id
          url
          secret
          size
        }
        collaborators {
          id
          fullName
          profileImage {
            id
            url
            secret
          }
        }
        initiator {
          id
          fullName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const SUBSCRIPTION_QUERY2 = gql`
  subscription($userID: ID!) {
    Memory(
      filter: {
        AND: [
          { mutation_in: [UPDATED, CREATED] }
          { node: { published: true } }
          { node: { inFeedOf_some: { id: $userID } } }
        ]
      }
    ) {
      node {
        id
        title
        likedBy {
          id
        }
        _likedByMeta {
          count
        }
        published
        startedAt
        endedAt
        updatedAt
        createdAt
        songs
        location
        images {
          id
          url
          secret
        }
        collaborators {
          id
          fullName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const FOLLOWERS_QUERY = gql`
  query FollowersQuery($searchString: String) {
    user {
      id
      followers(
        filter: {
          OR: [
            { userName_starts_with: $searchString }
            { fullName_contains: $searchString }
          ]
        }
        orderBy: fullName_DESC
      ) {
        key: id
        fullName
        userName
        profileImage {
          id
          url
          secret
        }
      }
      groups {
        key: id
        name
        members {
          id
        }
      }
    }
  }
`;

export const ALL_USERS_QUERY = gql`
  query AllUsersQuery($searchString: String, $userID: ID!, $initiator: ID) {
    allUsers(
      first: 20
      filter: {
        AND: [
          { id_not: $userID }
          { id_not: $initiator }
          {
            OR: [
              { userName_starts_with: $searchString }
              { fullName_contains: $searchString }
            ]
          }
        ]
      }
      orderBy: fullName_DESC
    ) {
      key: id
      fullName
      userName
      followers {
        id
        fullName
        userName
      }
      following {
        id
        fullName
        userName
      }
      profileImage {
        id
        url
        secret
      }
    }
  }
`;

export const USER_QUERY = gql`
  query UserQuery {
    user {
      id
      fullName
      userName
      profileImage {
        id
        url
        secret
      }
      notifications(orderBy: createdAt_DESC) {
        key: id
        type
        followedBy {
          id
          fullName
          userName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const NOTIFICATIONS_SUBSCRIPTION_QUERY = gql`
  subscription($userID: ID!) {
    Notification(
      filter: { mutation_in: [CREATED], node: { owner: { id: $userID } } }
    ) {
      node {
        key: id
        type
        followedBy {
          id
          fullName
          userName
          profileImage {
            id
            url
            secret
          }
        }
      }
    }
  }
`;

export const MEMORY_SUBMIT_MUTATION = gql`
  mutation submitMemory(
    $title: String!
    $description: String
    $location: Json
    $startedAt: DateTime!
    $endedAt: DateTime!
    $songs: [Json!]
    $privacyType: String
    $specificFollowers: [ID!]
    $excludedPeople: [ID!]
    $collaborators: [ID!]
    $initiator: ID!
    $parentMemory: [ID!]
    $showInFeed: Boolean!
    $isChildMemory: Boolean!
  ) {
    createMemory(
      title: $title
      collaboratorsIds: $collaborators
      initiatorId: $initiator
      startedAt: $startedAt
      endedAt: $endedAt
      location: $location
      description: $description
      songs: $songs
      privacyType: $privacyType
      specificFollowersIds: $specificFollowers
      excludedPeopleIds: $excludedPeople
      parentMemoriesIds: $parentMemory
      published: false
      showInFeed: $showInFeed
      isChildMemory: $isChildMemory
    ) {
      id
    }
  }
`;
export const PUBLISH_MEMORY_MUTATION = gql`
  mutation publishMemory($memoryID: ID!) {
    updateMemory(id: $memoryID, published: true) {
      id
    }
  }
`;

export const LIKE_MEMORY_MUTATION = gql`
  mutation likeMemory($memoryID: ID!, $userID: ID!) {
    addToMemoryOnUser1(likedByUserId: $userID, likedMemoryId: $memoryID) {
      likedMemory {
        id
      }
    }
  }
`;

export const UNLIKE_MEMORY_MUTATION = gql`
  mutation likeMemory($memoryID: ID!, $userID: ID!) {
    removeFromMemoryOnUser1(likedByUserId: $userID, likedMemoryId: $memoryID) {
      likedMemory {
        id
      }
    }
  }
`;

export const ADD_IMAGE_MUTATION = gql`
  mutation addImageToMemory($fileID: ID!, $memoryID: ID!) {
    addToMemoryOnFile(
      imagesFileId: $fileID
      imageOfMemoriesMemoryId: $memoryID
    ) {
      imagesFile {
        id
      }
    }
  }
`;
export const ADD_HEADERIMAGE_MUTATION = gql`
  mutation addHeaderimageToMemory($fileID: ID!, $memoryID: ID!) {
    addToMemoryOnFile1(
      headerImageFileId: $fileID
      headerImageOfMemoryId: $memoryID
    ) {
      headerImageFile {
        id
      }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation createUser(
    $userName: String!
    $fullName: String!
    $profileImage: ID!
    $idToken: String!
  ) {
    createUser(
      userName: $userName
      fullName: $fullName
      profileImageId: $profileImage
      authProvider: { auth0: { idToken: $idToken } }
    ) {
      id
    }
  }
`;

export const REMOVE_IMAGES_MUTATION = gql`
  mutation removeImagesFromMemory($memoryID: ID!) {
    updateMemory(id: $memoryID, images: []) {
      id
      images {
        id
      }
    }
  }
`;

export const UPDATE_MEMORY_MUTATION = gql`
  mutation updateMemory(
    $memoryID: ID!
    $songs: [Json!]
    $collaborators: [ID!]
    $title: String
    $images: [ID!]
    $childMemories: [ID!]
  ) {
    updateMemory(
      id: $memoryID
      songs: $songs
      collaboratorsIds: $collaborators
      title: $title
      imagesIds: $images
      childMemoriesIds: $childMemories
    ) {
      id
    }
  }
`;

export const DELETE_MEMORY_MUTATION = gql`
  mutation deleteMemory($memoryID: ID!) {
    deleteMemory(id: $memoryID) {
      id
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation updateUser(
    $userID: ID!
    $userName: String
    $fullName: String
    $profileImageId: ID
  ) {
    updateUser(
      id: $userID
      userName: $userName
      fullName: $fullName
      profileImageId: $profileImageId
    ) {
      id
    }
  }
`;

export const FOLLOW_MUTATION = gql`
  mutation follow($userID: ID!, $profileUserID: ID!) {
    addToUserOnUser(followersUserId: $userID, followingUserId: $profileUserID) {
      followingUser {
        id
      }
    }
  }
`;

export const UNFOLLOW_MUTATION = gql`
  mutation unfollow($userID: ID!, $profileUserID: ID!) {
    removeFromUserOnUser(
      followersUserId: $userID
      followingUserId: $profileUserID
    ) {
      followingUser {
        id
      }
    }
  }
`;

export const SET_INITIATOR_MUTATION = gql`
  mutation setInitiator($memoryID: ID!, $initiator: ID!) {
    updateMemory(id: $memoryID, initiatorId: $initiator) {
      id
    }
  }
`;

export const REMOVE_COLLABORATOR_MUTATION = gql`
  mutation removeCollaborator($memoryID: ID!, $collaborator: ID!) {
    removeFromMemoryOnUser(
      collaboratorsUserId: $collaborator
      memoriesMemoryId: $memoryID
    ) {
      collaboratorsUser {
        id
      }
    }
  }
`;

export const ADD_ONE_SIGNAL_ID_MUTATION = gql`
  mutation updateUser($userID: ID!, $oneSignalID: String!) {
    updateUser(id: $userID, oneSignalID: $oneSignalID) {
      id
    }
  }
`;

export const FOLLOW_NOTIFICATION_MUTATION = gql`
  mutation followNotification($userID: ID!, $profileUserID: ID!) {
    createNotification(
      type: FOLLOW
      followedById: $userID
      ownerId: $profileUserID
    ) {
      id
    }
  }
`;
