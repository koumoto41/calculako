FROM httpd:2.4

RUN sed -i \
        -e 's/^#\(LoadModule proxy_module modules\/mod_proxy.so\)/\1/' \
        -e 's/^#\(LoadModule proxy_fcgi_module modules\/mod_proxy_fcgi.so\)/\1/' \
        -e 's/^#\(LoadModule proxy_http_module modules\/mod_proxy_http.so\)/\1/' \
        -e 's/^#\(LoadModule proxy_wstunnel_module modules\/mod_proxy_wstunnel.so\)/\1/' \
        -e 's/^#\(LoadModule rewrite_module modules\/mod_rewrite.so\)/\1/' \
        -e 's/^#\(LoadModule headers_module modules\/mod_headers.so\)/\1/' \
        conf/httpd.conf \
    && echo 'Include conf/extra/vhost.conf' >> conf/httpd.conf

COPY docker/apache/vhost.conf /usr/local/apache2/conf/extra/vhost.conf
