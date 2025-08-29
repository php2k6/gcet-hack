import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Users, Target, Zap, Award, ArrowRight, CheckCircle } from 'lucide-react';

const AboutUs = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 15);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0x3b82f6, 0.8, 20);
        pointLight1.position.set(-8, 6, 3);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x10b981, 0.8, 20);
        pointLight2.position.set(8, 6, 3);
        scene.add(pointLight2);

        // Create city base
        const baseGeometry = new THREE.CylinderGeometry(12, 12, 0.5, 32);
        const baseMaterial = new THREE.MeshLambertMaterial({
            color: 0x2d3748,
            transparent: true,
            opacity: 0.9
        });
        const cityBase = new THREE.Mesh(baseGeometry, baseMaterial);
        cityBase.position.y = -2;
        cityBase.receiveShadow = true;
        scene.add(cityBase);

        // Create buildings with different heights and colors
        const buildings = [];
        const buildingColors = [0x3b82f6, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6];

        for (let i = 0; i < 25; i++) {
            const height = Math.random() * 4 + 1;
            const width = Math.random() * 0.8 + 0.5;

            const buildingGeometry = new THREE.BoxGeometry(width, height, width);
            const buildingMaterial = new THREE.MeshPhongMaterial({
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
                transparent: true,
                opacity: 0.8
            });

            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

            // Position buildings in a circle
            const angle = (i / 25) * Math.PI * 2;
            const radius = Math.random() * 8 + 3;
            building.position.x = Math.cos(angle) * radius;
            building.position.z = Math.sin(angle) * radius;
            building.position.y = height / 2 - 1.5;

            building.castShadow = true;
            building.receiveShadow = true;

            buildings.push(building);
            scene.add(building);
        }

        // Create floating particles representing citizen reports
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particles = [];

        for (let i = 0; i < 100; i++) {
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x3b82f6 : 0x10b981,
                transparent: true,
                opacity: 0.7
            });

            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 8 + 1,
                (Math.random() - 0.5) * 20
            );

            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    Math.random() * 0.01 + 0.005,
                    (Math.random() - 0.5) * 0.02
                ),
                life: Math.random() * 200
            };

            particles.push(particle);
            scene.add(particle);
        }

        // Create connection lines between buildings (representing AI connections)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.3
        });

        const connectionLines = [];
        for (let i = 0; i < 15; i++) {
            const building1 = buildings[Math.floor(Math.random() * buildings.length)];
            const building2 = buildings[Math.floor(Math.random() * buildings.length)];

            if (building1 !== building2) {
                const points = [
                    building1.position.clone().add(new THREE.Vector3(0, 1, 0)),
                    building2.position.clone().add(new THREE.Vector3(0, 1, 0))
                ];

                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                connectionLines.push(line);
                scene.add(line);
            }
        }

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Rotate the entire city slowly
            if (cityBase) {
                cityBase.rotation.y += 0.002;
            }

            // Animate buildings with slight floating effect
            buildings.forEach((building, index) => {
                building.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
            });

            // Animate particles
            particles.forEach((particle) => {
                particle.position.add(particle.userData.velocity);

                // Reset particle if it goes too far
                if (particle.position.y > 10 ||
                    Math.abs(particle.position.x) > 15 ||
                    Math.abs(particle.position.z) > 15) {
                    particle.position.set(
                        (Math.random() - 0.5) * 20,
                        -1,
                        (Math.random() - 0.5) * 20
                    );
                }

                // Fade particles
                particle.userData.life -= 1;
                if (particle.userData.life <= 0) {
                    particle.material.opacity = Math.max(0, particle.material.opacity - 0.01);
                    if (particle.material.opacity <= 0) {
                        particle.userData.life = 200;
                        particle.material.opacity = 0.7;
                    }
                }
            });

            // Animate connection lines opacity
            connectionLines.forEach((line, index) => {
                const opacity = 0.1 + Math.sin(Date.now() * 0.003 + index) * 0.2;
                line.material.opacity = Math.max(0.05, opacity);
            });

            // Camera gentle movement
            camera.position.x = Math.sin(Date.now() * 0.0005) * 2;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            if (!mountRef.current) return;

            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Intersection Observer for animations
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.3 }
        );

        if (mountRef.current) {
            observer.observe(mountRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    const stats = [
        { icon: Users, number: "50,000+", label: "Active Citizens" },
        { icon: Target, number: "15,000+", label: "Issues Resolved" },
        { icon: Zap, number: "24hrs", label: "Avg Response Time" },
        { icon: Award, number: "95%", label: "Success Rate" }
    ];

    const features = [
        "AI-powered issue categorization and routing",
        "Real-time status tracking and updates",
        "Community voting and validation system",
        "Transparent government accountability",
        "Mobile-first responsive design",
        "Multi-language support"
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
                    {/* Left Side - 3D Visualization */}
                    <div className="relative h-[600px] lg:h-[700px]">
                        <div
                            ref={mountRef}
                            className="w-full h-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl"
                            style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)' }}
                        />

                        {/* Overlay Info */}
                        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-gray-600">
                            <h3 className="text-lg font-semibold mb-2 text-blue-400">Smart City Network</h3>
                            <p className="text-sm text-gray-300">
                                AI-powered connections linking citizens to government services
                            </p>
                        </div>

                        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-gray-600">
                            <div className="flex items-center space-x-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm">Live Data Streaming</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {/* Header */}
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">CS</span>
                                </div>
                                <span className="text-blue-400 font-semibold text-lg tracking-wide">ABOUT CITISEVAK</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                                Revolutionizing
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"> Civic Engagement</span>
                                with AI
                            </h1>

                            <p className="text-xl text-gray-300 leading-relaxed mb-8">
                                CitiSevak isn't just a platform—it's a movement that empowers citizens to actively participate
                                in building better communities through AI-powered grievance management and transparent governance.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mission */}
                        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600">
                            <h3 className="text-2xl font-semibold mb-4 text-cyan-400">Our Mission</h3>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                To bridge the gap between citizens and government through cutting-edge AI technology,
                                creating transparent, efficient, and accountable public services that respond to community needs in real-time.
                            </p>

                            <div className="space-y-3">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3 text-gray-300"
                                    >
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                                <span>Join the Movement</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <button className="flex items-center justify-center space-x-2 border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                                <span>Learn More</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>
        </section>
    );
};

export default AboutUs;