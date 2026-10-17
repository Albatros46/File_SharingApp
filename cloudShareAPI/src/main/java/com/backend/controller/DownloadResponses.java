package com.backend.controller;

import com.backend.service.FileService.Download;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;

final class DownloadResponses {

    private DownloadResponses() {
    }

    static ResponseEntity<Resource> attachment(Download download) {
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.file().getName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.parseMediaType(download.file().getContentType()))
                .contentLength(download.file().getSize())
                .body(download.resource());
    }
}
