#include <iostream>
#include <fstream>
#include <cstdio>
#include <cstdlib>
#include <cmath>

struct Color{
    double r;
    double g;
    double b;
    
    Color(double r = 0, double g = 0, double b = 0){
        this->r = r;
        this->g = g;
        this->b = b;
    }

    ~Color(){
    }

    void scale(double k){
        this->r *= k;
        this->g *= k;
        this->b *= k;
    }

    Color operator+(const Color & c){
        return Color(r + c.r, g + c.g, b + c.b);
    }

    Color operator*(const double k){
        return Color(r * k, g * k, b * k);
    }

    friend std::ostream& operator<<(std::ostream&,const Color&);
};

std::ostream& operator<<(std::ostream& os, const Color& c){
    int r = int(std::pow(std::min(1.0, std::max(c.r, 0.0)), 1.0 / 2.2) * 255.0 + 0.5);
    int g = int(std::pow(std::min(1.0, std::max(c.g, 0.0)), 1.0 / 2.2) * 255.0 + 0.5);
    int b = int(std::pow(std::min(1.0, std::max(c.b, 0.0)), 1.0 / 2.2) * 255.0 + 0.5);
    return os << r << " " << g << " " << b;
}

int main(){
    const int height = 25;
    const int width = 25;

    const Color red(1, 0, 0);
    const Color green(0, 1, 0);
    const Color blue(0, 0, 1);
    const Color yellow(1, 1, 0);
    const Color orange(1, 0.5, 0);
    const Color aqua(0, 1, 1);
    const Color purple(0.5, 0, 0.5);
    const Color pink(1, 0, 1);

    const Color colors[] = {
        red, green, blue, yellow,
        orange, aqua, purple, pink
    };

    const int N = sizeof(colors) / sizeof(Color);

    const double light_x = 0.7;
    const double light_y = 0.3;
    const double light_z = 0.5;

    for(int h = 0; h < N; h++){
        char s[16];
        std::sprintf(s, "image/block%02d.ppm", h + 1);
        std::ofstream ofs(s);

        ofs << "P3\n" << width << " " << height << "\n255\n";
        
        for(int i = 0; i < height; i++){
            for(int j = 0; j < width; j++){
                Color c = colors[h];
                double x = double(j) / double(width - 1);
                double y = double(i) / double(height - 1);
                double z = 0.0;
                
                if(i == 0 || i == height - 1 || j == 0 || j == width - 1){
                    c.scale(0.3);
                }

                double ax = 0.0;
                double ay = 0.0;
                double az = - light_z;

                double bx = x - light_x;
                double by = y - light_y;
                double bz = z - light_z;

                double inner = ax * bx + ay * by + az * bz;
                double ab = std::sqrt(ax * ax + ay * ay + az * az) * std::sqrt(bx * bx + by * by + bz * bz);


                c.scale(inner / ab);

                ofs << c << "\n";
            }
        }

        ofs.close();
    }

    {
        std::ofstream ofs("image/wall.ppm");

        ofs << "P3\n" << width << " " << height << "\n255\n";

        // 25

        for(int i = 0; i < height; i++){
            for(int j = 0; j < width; j++){
                double x = double(j) / double(width - 1);
                double y = double(i) / double(height - 1);
                double z = 0.0;
                
                Color c(0.6, 0.6, 0.6);
                
                if(i % 8 == 0){
                    c.r = 0.2;
                    c.g = 0.2;
                    c.b = 0.2;
                }else if((j == 11 || j == 12) && ((i > 0 && i < 8) || (i > 16 && i < 24))){
                    c.r = 0.2;
                    c.g = 0.2;
                    c.b = 0.2;
                }else if((i > 8 && i < 16) && (j == 0 || j == width - 1)){
                    c.r = 0.2;
                    c.g = 0.2;
                    c.b = 0.2;
                }

                double ax = 0.0;
                double ay = 0.0;
                double az = - light_z;

                double bx = x - light_x;
                double by = y - light_y;
                double bz = z - light_z;

                double inner = ax * bx + ay * by + az * bz;
                double ab = std::sqrt(ax * ax + ay * ay + az * az) * std::sqrt(bx * bx + by * by + bz * bz);

                c.scale(inner / ab);

                ofs << c << "\n";
            }
        }

        ofs.close();

    }

    {
        std::ofstream ofs("image/back.ppm");
        
        ofs << "P3\n" << width << " " << height << "\n255\n";

        for(int i = 0; i < height; i++){
            for(int j = 0; j < width; j++){
                Color c0(0.18, 0.09, 0.03);
                Color c1(0.06, 0.03, 0.01);

                double x = double(j) / double(width - 1);
                double y = double(i) / double(height - 1);

                double t = std::abs(x - 0.5) + std::abs(y - 0.5);

                ofs << c0 * t + c1 * (1.0 - t) << "\n";
            }
        }

        ofs.close();
    }

    {
        std::ofstream ofs("image/net.ppm");

        ofs << "P3\n" << width << " " << height << "\n255\n";

        for(int i = 0; i < height; i++){
            for(int j = 0; j < width; j++){
                if((i + j) % 6 == 3 || std::abs(i - j) % 6 == 3){
                    ofs << Color(0.3, 0.3, 0.3) << "\n";
                }else{
                    ofs << Color(1.0, 1.0, 1.0) << "\n";
                }
            }
        }

        ofs.close();
    }

    {
        std::ofstream ofs("image/eraser.ppm");

        ofs << "P3\n" << width * 10 << " " << height << "\n255\n";

        for(int i = 0; i < height; i++){
            for(int j = 0; j < width * 10; j++){
                if(i % 5 == 0 || i % 5 == 4){
                    ofs << Color(0.0, 0.0, 0.0) << "\n";
                }else if(i % 5 == 1 || i % 5 == 3){
                    ofs << Color(0.5, 0.5, 0.5) << "\n";
                }else{
                    ofs << Color(1.0, 1.0, 1.0) << "\n";
                }
            }
        }

        ofs.close();
    }

    return 0;
}
