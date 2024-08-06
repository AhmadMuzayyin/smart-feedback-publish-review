@extends('layouts.admin')

@section('main-content')
    <!-- Page Heading -->
    <h1 class="h3 mb-4 text-gray-800">{{ __('Data Analisis Sentimen') }}</h1>

    @if (session('success'))
        <div class="alert alert-success border-left-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger border-left-danger" role="alert">
            <ul class="pl-4 my-2">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="row">
        <div class="col-lg-12 order-lg-1">

            <div class="card shadow mb-4">

                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Data Analisis Sentimen</h6>
                </div>

                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Profil</th>
                                    <th>Nama</th>
                                    <th>Sentimen</th>
                                    <th>Sekor Sentimen</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($sentiments as $sentimen)
                                    <tr>
                                        <td>
                                            <img src="{{ $sentimen['reviewer_photo_link'] }}" alt=""
                                                class="img-fluid rounded-circle">
                                        </td>
                                        <td>{{ $sentimen['reviewer_name'] }}</td>
                                        <td>
                                            @if ($sentimen['sentiment']['label'] == 'POSITIVE')
                                                <span
                                                    class="badge badge-success">{{ $sentimen['sentiment']['label'] }}</span>
                                            @elseif($sentimen['sentiment']['label'] == 'NEUTRAL')
                                                <span class="badge badge-info">{{ $sentimen['sentiment']['label'] }}</span>
                                            @else
                                                <span
                                                    class="badge badge-danger">{{ $sentimen['sentiment']['label'] }}</span>
                                            @endif
                                        </td>
                                        <td>{{ $sentimen['sentiment']['score'] }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>

        </div>

    </div>

@endsection
@push('js')
    <script>
        $(document).ready(function() {
            $('.table').DataTable({
                "order": [
                    ["desc"]
                ]
            });
        });
    </script>
@endpush
