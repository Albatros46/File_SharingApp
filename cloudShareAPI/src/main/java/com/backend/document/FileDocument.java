package com.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class FileDocument {

    @Id
    private String id;

    @Indexed
    private String ownerId;

    private String name;
    private String storedName;
    private String contentType;
    private long size;
    private boolean shared;
    private Instant uploadedAt;
}
