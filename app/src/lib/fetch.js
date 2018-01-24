import * as Config from "../config";
import RNFetchBlob from "react-native-fetch-blob";
import { client } from "../";
import { stringIsEmpty } from "../lib/functions";
import { setUploading } from "../redux/ducks/others";
import { Alert, AsyncStorage } from "react-native";
import {
  MEMORY_SUBMIT_MUTATION,
  ADD_IMAGE_MUTATION,
  USER_QUERY,
  PUBLISH_MEMORY_MUTATION,
  ADD_HEADERIMAGE_MUTATION,
  FEED_QUERY,
  PROFILE_MEMORIES_QUERY
} from "../lib/queries";

export function uploadImage(path) {
  return new Promise(function(resolve, reject) {
    RNFetchBlob.fetch(
      "POST",
      Config.GRAPHCOOL.fileEndpoint,
      {
        "Content-Type": "multipart/form-data"
      },
      [
        {
          name: "data",
          filename: "image",
          type: "image/jpg",
          data: RNFetchBlob.wrap(path)
        }
      ]
    )
      .catch(err => {
        reject(err);
      })
      .then(res => res.json())
      .then(file => {
        resolve(file.id);
      });
  });
}

export function uploadChildmemories(
  childMemories,
  startedAt,
  userID,
  memoryID
) {
  return new Promise(function(resolve, reject) {
    let childFinished = 1;

    if (childMemories.length > 0) {
      childMemories.map((memory, index) => {
        let childSongsArray = [];
        if (memory.songs) {
          memory.songs.map(song => {
            childSongsArray.push(song);
          });
        }

        client
          .mutate({
            mutation: MEMORY_SUBMIT_MUTATION,
            variables: {
              title: memory.title,
              location: memory.location,
              description: memory.description,
              startedAt: memory.startedAt,
              endedAt: memory.startedAt,
              collaborators: [],
              initiator: userID,
              songs: childSongsArray,
              privacyType: "everybody",
              specificFollowers: [],
              excludedPeople: [],
              parentMemory: [memoryID],
              showInFeed: false,
              isChildMemory: true
            }
          })
          .then(res => {
            const childID = res.data.createMemory.id;

            if (memory.images.length > 0) {
              let childImagesFinished = 1;
              memory.images.map(image => {
                uploadImage(
                  RNFetchBlob.fs.dirs.DocumentDir +
                    "/" +
                    memory.tempMemoryID +
                    "/" +
                    image.filename
                )
                  .then(fileID => {
                    client
                      .mutate({
                        mutation: ADD_IMAGE_MUTATION,
                        variables: {
                          fileID: fileID,
                          memoryID: childID
                        }
                      })
                      .then(() => {
                        if (childImagesFinished === memory.images.length) {
                          client
                            .mutate({
                              mutation: PUBLISH_MEMORY_MUTATION,
                              variables: {
                                memoryID: childID
                              }
                            })
                            .then(() => {
                              if (childFinished === childMemories.length) {
                                resolve();
                              }
                              childFinished++;
                            })
                            .catch(err => {
                              reject(err);
                            });
                        } else {
                          childImagesFinished++;
                        }
                      })
                      .catch(err => {
                        reject(err);
                      });
                  })
                  .catch(err => {
                    reject(err);
                  });
              });
            } else {
              client
                .mutate({
                  mutation: PUBLISH_MEMORY_MUTATION,
                  variables: { memoryID: childID }
                })
                .then(() => {
                  if (childFinished === childMemories.length) {
                    resolve();
                  }
                  childFinished++;
                })
                .catch(err => {
                  reject(err);
                });
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    } else {
      resolve();
    }
  });
}

function publishMemory(memoryID) {
  return new Promise(function(resolve, reject) {
    client
      .mutate({
        mutation: PUBLISH_MEMORY_MUTATION,
        variables: { memoryID }
      })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function uploadMemory(memoryObj) {
  return new Promise(function(resolve, reject) {
    let {
      title,
      location,
      startedAt,
      endedAt,
      userID,
      songs,
      headerImage,
      privacyType,
      collaborators,
      specificFollowers,
      excludedPeople,
      showInFeed,
      childMemories,
      images,
      tempMemoryID
    } = memoryObj;
    client
      .mutate({
        mutation: MEMORY_SUBMIT_MUTATION,
        variables: {
          title,
          location,
          startedAt,
          endedAt,
          headerImage,
          songs,
          privacyType,
          collaborators,
          initiator: userID,
          specificFollowers,
          excludedPeople,
          showInFeed,
          parentMemory: [],
          isChildMemory: false
        }
      })
      .then(res => {
        const memoryID = res.data.createMemory.id;
        uploadImage(
          RNFetchBlob.fs.dirs.DocumentDir +
            "/" +
            tempMemoryID +
            "/" +
            headerImage.filename
        )
          .then(fileID => {
            client
              .mutate({
                mutation: ADD_HEADERIMAGE_MUTATION,
                variables: { fileID: fileID, memoryID: memoryID }
              })
              .then(() => {
                if (images.length > 0) {
                  let finished = 1;
                  images.map(image => {
                    uploadImage(
                      RNFetchBlob.fs.dirs.DocumentDir +
                        "/" +
                        tempMemoryID +
                        "/" +
                        image.filename
                    )
                      .then(fileID => {
                        client
                          .mutate({
                            mutation: ADD_IMAGE_MUTATION,
                            variables: { fileID: fileID, memoryID: memoryID }
                          })
                          .then(() => {
                            if (finished === images.length) {
                              if (childMemories.length > 0) {
                                uploadChildmemories(
                                  childMemories,
                                  startedAt,
                                  userID,
                                  memoryID,
                                  collaborators
                                )
                                  .then(() => {
                                    publishMemory(memoryID).then(() =>
                                      resolve()
                                    );
                                  })
                                  .catch(error => {
                                    reject(error);
                                  });
                              } else {
                                publishMemory(memoryID).then(() => resolve());
                              }
                            } else {
                              finished++;
                            }
                          });
                      })
                      .catch(err => {
                        reject(err);
                      });
                  });
                } else {
                  if (childMemories.length > 0) {
                    uploadChildmemories(
                      childMemories,
                      startedAt,
                      userID,
                      memoryID
                    )
                      .then(() => {
                        publishMemory(memoryID).then(() => resolve());
                      })
                      .catch(error => {
                        reject(error);
                      });
                  } else {
                    publishMemory(memoryID).then(() => resolve());
                  }
                }
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
}
