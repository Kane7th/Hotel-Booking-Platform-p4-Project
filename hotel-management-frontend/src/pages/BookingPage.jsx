import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../api/booking';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const BookingPage = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const response = await bookingService.getAvailableRooms(token);
        setRooms(response.data);
      } catch (error) {
        toast.error('Failed to load rooms');
      }
    };
    fetchAvailableRooms();
  }, [token]);

  const handleBooking = async () => {
    if (!selectedRoom) {
      toast.warning('Please select a room');
      return;
    }

    try {
      await bookingService.createBooking(token, {
        room_id: selectedRoom.id,
        check_in: checkIn.toISOString().split('T')[0],
        check_out: checkOut.toISOString().split('T')[0]
      });
      toast.success('Booking successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Book a Room</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Rooms</h3>
          <div className="space-y-4">
            {rooms.map(room => (
              <div 
                key={room.id} 
                className={`p-4 border rounded cursor-pointer ${selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedRoom(room)}
              >
                <h4 className="font-medium">{room.room_number}</h4>
                <p>Type: {room.type}</p>
                <p>Price: ${room.price}/night</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Check-in:</label>
              <DatePicker 
                selected={checkIn} 
                onChange={date => setCheckIn(date)} 
                className="w-full p-2 border rounded"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="block mb-2">Check-out:</label>
              <DatePicker 
                selected={checkOut} 
                onChange={date => setCheckOut(date)} 
                className="w-full p-2 border rounded"
                minDate={checkIn}
              />
            </div>
            <button 
              onClick={handleBooking}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
