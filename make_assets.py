# Erzeugt Standard-Audio (WAV) und Icons. Eigene Dateien mit gleichem Namen in assets/audio/ ersetzen diese einfach.
import wave,struct,math,random,zlib,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def wav(n,sr,s):
    w=wave.open('sound-%s.wav'%n,'w');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr)
    w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v))*30000)) for v in s));w.close()
sr=11025;y=0;out=[]
for i in range(sr*6+2000):
    y+=.04*(random.uniform(-1,1)-y)
    if i>=2000:out.append(y*5*(.5+.5*math.sin(2*math.pi*(i-2000)/(sr*6))**2))
wav('wind',sr,out)
sr=22050;b=[0.0]*int(sr*1.6)
for st in(0,.35,.8):
    for i in range(int(sr*.25)):
        t=i/sr;f=3000+4000*t+300*math.sin(t*90);b[int(st*sr)+i]+=.35*math.sin(2*math.pi*f*t)*math.sin(math.pi*t/.25)
wav('bird',sr,b)
def tone(n,notes,d):
    s=[0.0]*int(sr*d)
    for f,st in notes:
        for i in range(int(sr*(d-st))):s[int(st*sr)+i]+=.4*math.sin(2*math.pi*f*i/sr)*math.exp(-i/sr*7)
    wav(n,sr,s)
tone('click',[(700,0)],.08);tone('build',[(330,0),(494,.12)],.5);tone('bell',[(660,0),(990,.1),(1320,.2)],1)
def png(n,name):
    raw=b''
    for y in range(n):
        r=bytearray([0])
        for x in range(n):
            d=abs(x-n/2)/(n*.34)+abs(y-n/2)/(n*.2);c=(47,74+y*30//n,42)
            if d<1:c=(224,176,72)
            if d<.5:c=(150,60,40)
            r+=bytes(c)
        raw+=bytes(r)
    ch=lambda t,d:struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d))
    open(name,'wb').write(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',n,n,8,2,0,0,0))+ch(b'IDAT',zlib.compress(raw))+ch(b'IEND',b''))
for n in(180,192,512):png(n,'icon-%d.png'%n)
