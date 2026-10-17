package com.backend.repository;

import com.backend.document.FileDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends MongoRepository<FileDocument, String> {

    List<FileDocument> findByOwnerIdOrderByUploadedAtDesc(String ownerId);

    Optional<FileDocument> findByIdAndOwnerId(String id, String ownerId);
}
